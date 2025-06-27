package http

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/algo-casino/payapi"
	"github.com/go-chi/chi/v5"
)

type (
	stakingResultCreateRequest struct {
		Profit uint64 `json:"profit" validate:"required,numeric"`
	}
)

func (s *Server) registerStakingPeriodRoutes() chi.Router {
	r := chi.NewRouter()

	// unauthenticated routes
	r.Group(func(r chi.Router) {
		// raw index route (returns view)
		r.Get("/", s.handleStakingPeriodsIndex)

		// create
		//r.Post("/", s.handleStakingPeriodsCreate)

		r.Route("/{id}", func(r chi.Router) {
			// get individual
			r.Get("/", s.handleStakingPeriodsGet)

			// create result
			r.Post("/createResult", s.handleStakingPeriodsCreateResult)

			// do autostake
			r.Post("/autoStake", s.handleAutoStakeCreate)

			// get latest profit for period
			r.Get("/profit", s.handleStakingPeriodsGetProfit)
		})
	})

	return r
}

func (s *Server) handleStakingPeriodsIndex(w http.ResponseWriter, r *http.Request) {
	sps, err := s.app.StakingPeriodService.FindStakingPeriods(r.Context(), payapi.StakingPeriodFilter{})
	if err != nil {
		s.respondWithError(w, r, http.StatusBadRequest, err.Error())
		return
	}

	// write response
	w.Header().Add("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sps)
}

// func (s *Server) handleStakingPeriodsCreate(w http.ResponseWriter, r *http.Request) {

// }

func (s *Server) handleStakingPeriodsGet(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 32)
	if err != nil {
		s.respondWithError(w, r, http.StatusBadRequest, err.Error())
		return
	}

	sp, err := s.app.StakingPeriodService.FindStakingPeriodByID(r.Context(), int(id))
	if err != nil {
		s.respondWithError(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	// write response
	w.Header().Add("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sp)
}

// func (s *Server) handleStakingPeriodsCommitmentsGet(w http.ResponseWriter, r *http.Request) {
// 	id, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 32)
// 	if err != nil {
// 		s.respondWithError(w, r, http.StatusBadRequest, err.Error())
// 		return
// 	}

// 	scs, err := s.StakingCommitmentService.ListByStakingPeriodId(r.Context(), id)
// 	if err != nil {
// 		s.respondWithError(w, r, http.StatusInternalServerError, err.Error())
// 		return
// 	}

// 	// write response
// 	w.Header().Add("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(scs)
// }

func (s *Server) handleStakingPeriodsCreateResult(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 32)
	if err != nil {
		s.respondWithError(w, r, http.StatusBadRequest, err.Error())
		return
	}

	params, err := decodeAndValidateRequest[*stakingResultCreateRequest](r.Body, &s.Validator)
	if err != nil {
		s.respondWithError(w, r, http.StatusBadRequest, ErrBadParameters)
		return
	}

	stakingPeriodId := int(id)

	res, err := s.app.StakingResultService.CreateStakingResult(r.Context(), stakingPeriodId, params.Profit)
	if err != nil {
		s.respondWithError(w, r, http.StatusBadRequest, ErrGeneric)
		return
	}

	// write response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func (s *Server) handleAutoStakeCreate(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 32)
	if err != nil {
		s.respondWithError(w, r, http.StatusBadRequest, err.Error())
		return
	}

	err = s.app.StakingNftService.CreateAutoStake(r.Context(), int(id))
	if err != nil {
		s.respondWithError(w, r, http.StatusInternalServerError, "failed to create auto stake commitments")
		return
	}

	// notify it's been created
	w.WriteHeader(http.StatusCreated)
	return
}

func (s *Server) handleStakingPeriodsGetProfit(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 32)
	if err != nil {
		s.respondWithError(w, r, http.StatusBadRequest, err.Error())
		return
	}

	snapshot, err := s.app.StakeProfitSnapshotService.GetLastKnownProfitForPeriod(r.Context(), int(id))
	if err != nil {
		s.respondWithError(w, r, http.StatusInternalServerError, "failed to get profit")
		return
	}

	// write response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(snapshot)
}
