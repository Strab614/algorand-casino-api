package http

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/algo-casino/payapi/stake"
	"github.com/algo-casino/payapi/utils"
	"github.com/go-chi/chi/v5"
)

type (
	checkProfileRequest struct {
		Address string `json:"address" validate:"required,len=58"`
	}

	nftCheckResponse struct {
		Type int `json:"type"` // -1 = err, 0 = 1%, 1 = 10%
		*stake.UserProfile
	}
)

func (s *Server) registerCasinoRoutes() chi.Router {
	r := chi.NewRouter()

	// unauthenticated routes
	r.Group(func(r chi.Router) {
		// submit request for claim
		r.Get("/top", s.handleGetLeaderboard)

		// check refund entitlement
		r.Post("/check", s.handleCheckProfile)

		// submit request for claim
		r.Post("/claim", s.handleClaimRequest)
	})

	return r
}

func (s *Server) handleGetLeaderboard(w http.ResponseWriter, r *http.Request) {
	endTime := time.Now().UTC()
	//startTime := endTime.Add(time.Duration(-13) * time.Hour) // 168 previously

	startTime := utils.GetStartDayOfWeek(time.Now().UTC())
	fmt.Printf("startTime: %v\n", startTime)
	fmt.Printf("endTime: %v\n", endTime)
	leaderboard, err := s.app.StakeService.GetTopTenWagered(r.Context(), startTime, endTime)
	if err != nil {
		fmt.Printf("err: %v\n", err)
		s.respondWithError(w, r, http.StatusInternalServerError, ErrGeneric)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(leaderboard)
}

func (s *Server) handleCheckProfile(w http.ResponseWriter, r *http.Request) {
	params, err := decodeAndValidateRequest[*checkProfileRequest](r.Body, &s.Validator)
	if err != nil {
		s.respondWithError(w, r, http.StatusBadRequest, ErrBadParameters)
		return
	}

	t, profile, err := s.app.CasinoRefundService.CheckRefund(r.Context(), params.Address)
	if err != nil {
		fmt.Printf("err: %v\n", err)
		s.respondWithError(w, r, http.StatusInternalServerError, ErrGeneric)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(nftCheckResponse{
		Type:        t,
		UserProfile: profile,
	})
}

func (s *Server) handleClaimRequest(w http.ResponseWriter, r *http.Request) {
	params, err := decodeAndValidateRequest[*checkProfileRequest](r.Body, &s.Validator)
	if err != nil {
		s.respondWithError(w, r, http.StatusBadRequest, ErrBadParameters)
		return
	}

	refund, err := s.app.CasinoRefundService.CreateRefund(r.Context(), params.Address)
	if err != nil {
		fmt.Printf("err: %v\n", err)
		s.respondWithError(w, r, http.StatusInternalServerError, ErrGeneric)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(refund)
}
