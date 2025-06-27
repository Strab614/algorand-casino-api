package http

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/algo-casino/payapi"
	"github.com/go-chi/chi/v5"
)

type (
	paymentCreateRequest struct {
		PlatformId int    `json:"platformId" validate:"required,numeric"` // who does this belong to
		Sender     string `json:"sender" validate:"required,len=58"`
		AssetId    uint64 `json:"assetId" validate:"required,numeric"`
		Amount     uint64 `json:"amount" validate:"required,numeric"`

		ExternalId int `json:"externalId" validate:"required,numeric"` // ID of the payment for the webhook callback
	}

	paymentCompleteRequest struct {
		Round         *uint64 `json:"round" validate:"omitempty,numeric"` // the round this transaction was completed/available on chain
		TransactionID string  `json:"txid" validate:"required,len=52"`
	}
)

func (s *Server) registerPaymentRoutes() chi.Router {
	r := chi.NewRouter()

	// unauthenticated routes
	r.Group(func(r chi.Router) {
		// raw index route (returns view)
		r.Post("/", s.handlePaymentCreate)

		r.Route("/{id}", func(r chi.Router) {
			r.Post("/complete", s.handlePaymentComplete)
		})

	})

	return r
}

func (s *Server) handlePaymentCreate(w http.ResponseWriter, r *http.Request) {
	params, err := decodeAndValidateRequest[*paymentCreateRequest](r.Body, &s.Validator)
	if err != nil {
		s.respondWithError(w, r, http.StatusBadRequest, ErrBadParameters)
		return
	}

	payment := payapi.Payment{
		PlatformId: int(params.PlatformId),

		Status:  payapi.StatusCreated,
		Sender:  params.Sender,
		AssetId: params.AssetId,
		Amount:  params.Amount,

		ExternalId: params.ExternalId,
	}

	err = s.app.PaymentService.CreatePayment(r.Context(), &payment)
	if err != nil {
		fmt.Printf("err: %v\n", err)
		s.respondWithError(w, r, http.StatusInternalServerError, ErrCreatePayment)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(payment)
}

func (s *Server) handlePaymentComplete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 32)
	if err != nil {
		s.respondWithError(w, r, http.StatusBadRequest, ErrBadParameters)
		return
	}

	params, err := decodeAndValidateRequest[*paymentCompleteRequest](r.Body, &s.Validator)
	if err != nil {
		s.respondWithError(w, r, http.StatusBadRequest, ErrBadParameters)
		return
	}

	p, err := s.app.PaymentService.CheckAndCompletePayment(r.Context(), int(id), params.TransactionID, params.Round)
	if err != nil {
		log.Printf("CheckAndCompletePayment() failed err: %v\n", err)
		s.respondWithError(w, r, http.StatusInternalServerError, ErrCompletePayment)
		return
	}

	// return the payment struct to the user with updated fields (txid and completed_at)
	json.NewEncoder(w).Encode(p)
}
