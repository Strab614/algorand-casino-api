package http

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/algo-casino/payapi"
	"github.com/go-chi/chi/v5"
)

func (s *Server) registerStakingResultRoutes() chi.Router {
	r := chi.NewRouter()

	// unauthenticated routes
	r.Group(func(r chi.Router) {
		// raw index route (returns view)
		r.Get("/", s.handleStakingResultIndex)
	})

	return r
}

func (s *Server) handleStakingResultIndex(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.URL.Query().Get("stakingPeriodId"), 10, 32)
	if err != nil {
		s.respondWithError(w, r, http.StatusBadRequest, err.Error())
		return
	}
	t := int(id)

	scs, err := s.app.StakingResultService.FindStakingResults(r.Context(), payapi.StakingResultFilter{StakingPeriodId: &t})
	if err != nil {
		s.respondWithError(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	// write response
	w.Header().Add("Content-Type", "application/json")
	json.NewEncoder(w).Encode(scs)
}
