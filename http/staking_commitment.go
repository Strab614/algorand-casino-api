package http

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/algo-casino/payapi"
	"github.com/go-chi/chi/v5"
)

type (
	stakingCommitmentCreate struct {
		*AuthRequest // Require signed txn

		StakingPeriodID       int    `json:"stakingPeriodId"`
		AlgorandAddress       string `json:"algorandAddress" validate:"required,len=58"`
		ChipCommitment        uint64 `json:"chipCommitment"`
		LiquidityCommitment   uint64 `json:"liquidityCommitment"`
		LiquidityCommitmentV2 uint64 `json:"liquidityCommitmentV2"`

		// new liquid concensus targets
		CAlgoCommitment uint64 `json:"cAlgoCommitment"`
		TAlgoCommitment uint64 `json:"tAlgoCommitment"`
		MAlgoCommitment uint64 `json:"mAlgoCommitment"`
		XAlgoCommitment uint64 `json:"xAlgoCommitment"`
	}

	stakingCommitmentUpdate struct {
		*AuthRequest

		ChipCommitment        uint64 `json:"chipCommitment"`
		LiquidityCommitment   uint64 `json:"liquidityCommitment"`
		LiquidityCommitmentV2 uint64 `json:"liquidityCommitmentV2"`

		// new liquid concensus targets
		CAlgoCommitment uint64 `json:"cAlgoCommitment"`
		TAlgoCommitment uint64 `json:"tAlgoCommitment"`
		MAlgoCommitment uint64 `json:"mAlgoCommitment"`
		XAlgoCommitment uint64 `json:"xAlgoCommitment"`
	}
)

func (s *Server) registerStakingCommitmentRoutes() chi.Router {
	r := chi.NewRouter()

	// unauthenticated routes
	r.Group(func(r chi.Router) {
		// raw index route (returns view)
		r.Get("/", s.handleStakingCommitmentsIndex)
	})

	// authenticated routes (requires signed txn)
	r.Group(func(r chi.Router) {
		// create
		r.Post("/", s.handleStakingCommitmentsCreate)

		// update
		r.Put("/{id}", s.handleStakingCommitmentsUpdate)
	})

	return r
}

func (s *Server) handleStakingCommitmentsIndex(w http.ResponseWriter, r *http.Request) {
	// filter, err := decodeAndValidateRequest[payapi.StakingCommitmentFilter](r.Body, &s.Validator)
	// if err != nil {
	// 	s.respondWithError(w, r, http.StatusBadRequest, ErrBadParameters)
	// 	return
	// }

	id, err := strconv.ParseInt(r.URL.Query().Get("stakingPeriodId"), 10, 32)
	if err != nil {
		s.respondWithError(w, r, http.StatusBadRequest, err.Error())
		return
	}
	t := int(id)

	scs, err := s.app.StakingCommitmentService.FindStakingCommitments(r.Context(), payapi.StakingCommitmentFilter{StakingPeriodId: &t})
	if err != nil {
		s.respondWithError(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	// write response
	w.Header().Add("Content-Type", "application/json")
	json.NewEncoder(w).Encode(scs)
}

func (s *Server) handleStakingCommitmentsCreate(w http.ResponseWriter, r *http.Request) {
	params := &stakingCommitmentCreate{}

	err := json.NewDecoder(r.Body).Decode(params)
	if err != nil {
		s.respondWithError(w, r, http.StatusBadRequest, "json decode err: "+err.Error())
		return
	}

	err, ok := CheckAuth(params.AuthRequest)
	if err == nil && ok {
		fmt.Printf("success! %s validated on behalf of %s\n", params.PubKey, params.AlgorandAddress)
	} else {
		s.respondWithError(w, r, http.StatusUnauthorized, "bad auth data")
		return
	}

	if params.AlgorandAddress != params.PubKey {
		s.respondWithError(w, r, http.StatusUnauthorized, "you have not signed the txn for this address")
		return
	}

	fmt.Println("validated, user owns address, proceeding with create")

	// TODO: validate
	// err = s.Validator.Validate(params)
	// if err != nil {
	// 	s.respondWithError(w, r, http.StatusBadRequest, "Request validation failed!")
	// 	return
	// }

	sc := &payapi.StakingCommitment{
		StakingPeriodID:       int(params.StakingPeriodID),
		AlgorandAddress:       params.AlgorandAddress,
		ChipCommitment:        params.ChipCommitment,
		LiquidityCommitment:   params.LiquidityCommitment,
		LiquidityCommitmentV2: params.LiquidityCommitmentV2,
		CAlgoCommitment:       params.CAlgoCommitment,
		TAlgoCommitment:       params.TAlgoCommitment,
		MAlgoCommitment:       params.MAlgoCommitment,
		XAlgoCommitment:       params.XAlgoCommitment,
	}

	err = s.app.StakingCommitmentService.CreateStakingCommitment(r.Context(), sc)
	if err != nil {
		// horrible crime against programming, but shit it works
		if strings.Contains(err.Error(), "23505") {
			s.respondWithError(w, r, http.StatusBadRequest, ErrAlreadyRegistered)
		} else {
			s.respondWithError(w, r, http.StatusInternalServerError, ErrGeneric)
		}
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(sc)
}

func (s *Server) handleStakingCommitmentsUpdate(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 32)
	if err != nil {
		s.respondWithError(w, r, http.StatusBadRequest, err.Error())
		return
	}

	// lookup commitment
	stakingCommitment, err := s.app.StakingCommitmentService.FindStakingCommitmentByID(r.Context(), int(id))
	if err != nil {
		s.respondWithError(w, r, http.StatusBadRequest, "no such commitment exists")
		return
	}

	// lookup staking period
	sp, err := s.app.StakingPeriodService.FindStakingPeriodByID(r.Context(), stakingCommitment.StakingPeriodID)
	if err != nil {
		s.respondWithError(w, r, http.StatusInternalServerError, "uwot"+err.Error())
		return
	}

	// get current UTC time
	currentTime := time.Now().UTC()

	// has registration period ended? if so we can't allow them to update
	if currentTime.After(sp.RegistrationEnd) {
		s.respondWithError(w, r, http.StatusInternalServerError, ErrNoEditDuringCommitment)
		return
	}

	params := &stakingCommitmentUpdate{}

	err = json.NewDecoder(r.Body).Decode(params)
	if err != nil {
		s.respondWithError(w, r, http.StatusBadRequest, err.Error())
		return
	}

	err, ok := CheckAuth(params.AuthRequest)
	if err != nil || !ok {
		s.respondWithError(w, r, http.StatusUnauthorized, "bad auth data")
		return
	}

	if stakingCommitment.AlgorandAddress != params.PubKey {
		s.respondWithError(w, r, http.StatusUnauthorized, "you have not signed the txn for this address")
		return
	}

	sc := &payapi.StakingCommitment{
		ID:                    int(id),
		StakingPeriodID:       stakingCommitment.StakingPeriodID,
		ChipCommitment:        params.ChipCommitment,
		LiquidityCommitment:   params.LiquidityCommitment,
		LiquidityCommitmentV2: params.LiquidityCommitmentV2,
		CAlgoCommitment:       params.CAlgoCommitment,
		TAlgoCommitment:       params.TAlgoCommitment,
		MAlgoCommitment:       params.MAlgoCommitment,
		XAlgoCommitment:       params.XAlgoCommitment,
	}

	err = s.app.StakingCommitmentService.UpdateStakingCommitment(r.Context(), sc)
	if err != nil {
		s.respondWithError(w, r, http.StatusInternalServerError, "failed to update commitment")
		return
	}

	msg := fmt.Sprintf("%s updated commitment %d! chip: %d -> %d\t lp: %d -> %d\t lp v2: %d -> %d\n", stakingCommitment.AlgorandAddress, stakingCommitment.ID, stakingCommitment.ChipCommitment, sc.ChipCommitment, stakingCommitment.LiquidityCommitment, sc.LiquidityCommitment, stakingCommitment.LiquidityCommitmentV2, sc.LiquidityCommitmentV2)
	s.app.NotifyService.Notify(r.Context(), msg)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(sc)
}
