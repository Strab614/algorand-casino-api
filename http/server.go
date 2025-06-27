package http

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	//"github.com/algo-casino/payment-gateway/inmem"

	"github.com/algo-casino/payapi"
	"github.com/algo-casino/payapi/utils"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/httprate"
)

type Server struct {
	app    payapi.App
	server *http.Server
	router *chi.Mux

	// Validator
	Validator utils.Validator
}

func NewServer(app *payapi.App) *Server {
	s := &Server{
		server: &http.Server{},
		router: chi.NewRouter(),
		app:    *app,
	}

	// basic middleware stack
	s.router.Use(middleware.RequestID)
	s.router.Use(middleware.RealIP)
	s.router.Use(middleware.Logger)
	s.router.Use(middleware.Recoverer)

	s.router.Use(cors.Handler(cors.Options{
		//AllowedOrigins: []string{"https://labs.algo-casino.com"},
		AllowedOrigins:  []string{"https://*", "http://*"}, // allow any origin
		AllowOriginFunc: func(r *http.Request, origin string) bool { return true },
		AllowedMethods:  []string{"POST", "OPTIONS", "GET", "PUT"},
		AllowedHeaders:  []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "X-Xsrf-Token"},
		//ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		//Debug:            true,
		MaxAge: 300, // Maximum value not ignored by any of major browsers
	}))

	// max 5 request per ip/30 seconds
	s.router.Use(httprate.Limit(
		10,
		10*time.Second,
		httprate.WithKeyFuncs(httprate.KeyByIP),
		httprate.WithLimitHandler(func(w http.ResponseWriter, r *http.Request) {
			s.respondWithError(w, r, http.StatusTooManyRequests, "Too many requests, try again in 10 seconds!")
		},
		)))

	s.router.Mount("/platforms", s.registerPlatformRoutes())
	s.router.Mount("/payments", s.registerPaymentRoutes())
	s.router.Mount("/casino", s.registerCasinoRoutes())

	s.router.Mount("/stakingPeriods", s.registerStakingPeriodRoutes())
	s.router.Mount("/stakingCommitments", s.registerStakingCommitmentRoutes())
	s.router.Mount("/stakingResults", s.registerStakingResultRoutes())

	return s
}

// Starts the server in a separate goroutine
// Can be gracefully closed by calling Close() function
func (s *Server) Start(port string) {
	s.server = &http.Server{
		Addr:    ":" + port,
		Handler: s.router,
	}

	go func() {
		err := s.server.ListenAndServe()
		if err != nil && err != http.ErrServerClosed {
			fmt.Printf("error: %v\n", err)
		}
	}()
}

// Gracefully shutdown the server
func (s *Server) Close() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := s.server.Shutdown(ctx); err != nil {
		return err
	}

	return nil
}

type ErrorResponse struct {
	Message string `json:"message"`
}

func (s *Server) respondWithError(w http.ResponseWriter, r *http.Request, statusCode int, message string) {
	// get request ID from context
	reqID := middleware.GetReqID(r.Context())

	text := fmt.Sprintf("ReqID: %s (IP Addr: %s) Error: (HTTP %d) %s\n", reqID, r.RemoteAddr, statusCode, message)
	// log to stderr
	fmt.Fprint(os.Stderr, text)
	// log to slack
	//s.SlackService.Notify(r.Context(), text)

	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(&ErrorResponse{
		Message: message,
	})
}

// helper function to remove a lot of duplicated code
// decodes
func decodeAndValidateRequest[T any](r io.Reader, v *utils.Validator) (T, error) {
	var tmp T

	err := json.NewDecoder(r).Decode(&tmp)
	if err != nil {
		return tmp, err
	}

	// hack because can't return a nil generic type
	var obj T

	// if user passed us a validator
	if v != nil && v.Validate(tmp) != nil {
		return obj, err
	}

	obj = tmp

	return obj, nil
}
