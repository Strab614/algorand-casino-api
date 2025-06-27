package http

import (
	"github.com/go-chi/chi/v5"
)

type (
	_paymentCreateRequest struct {
		PlatformId uint64 `json:"platformId" validate:"required,numeric"` // who does this belong to
		Sender     string `json:"sender" validate:"required,len=58"`
		AssetId    uint64 `json:"assetId" validate:"required,numeric"`
		Amount     uint64 `json:"amount" validate:"required,numeric"`

		ExternalId uint64 `json:"externalId" validate:"required,numeric"` // ID of the payment for the webhook callback
	}
)

func (s *Server) registerPlatformRoutes() chi.Router {
	r := chi.NewRouter()

	// unauthenticated routes
	r.Group(func(r chi.Router) {
		// raw index route (returns view)
		// r.Post("/", s.handlePlatformCreate)

		// r.Route("/{id}", func(r chi.Router) {
		// 	r.Post("/complete", s.handlePaymentComplete)
		// })

	})

	return r
}

// func (s *Server) handlePlatformCreate(w http.ResponseWriter, r *http.Request) {
//}
