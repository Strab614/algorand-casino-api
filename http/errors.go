package http

// type ServerError struct {
// 	code    int
// 	message string
// }

const (
	// ErrBadGeneric = ServerError{
	// 	code:    http.StatusBadRequest,
	// 	message: "bad parameters, check your request",
	// }

	ErrBadParameters     = "bad parameters, check your request"
	ErrCreatePayment     = "failed to create payment"
	ErrCompletePayment   = "failed to complete payment"
	ErrGeneric           = "Something went wrong!"
	ErrRecentTransaction = "You have already claimed your CHIPS, Check back tomorrow for more."
	ErrLowBalance        = "The faucet has run dry. Check back later!"
	ErrSendAssetFailed   = "Unable to send CHIPS. Please make sure you have added the CHIPS ASA ID: 388592191 to your wallet."

	// reCAPTCHA specific
	ErrRecaptcha    = "Something went wrong with the reCAPTCHA."
	ErrBadRecaptcha = "You have provided a bad reCAPTCHA."

	// address validator middleware
	ErrBadAddress = "You have not provided a valid algorand address."

	// additional validation, in instance user doesn't meet tx count requirements
	ErrLowTransactionCount = "You don't have enough transactions on your account."

	// doesn't hold correct asset or meet requirements
	ErrNotAllowed = "The Faucet is for liquidity providers, please provide liquidity on tinyman and make sure you have at least 1 Tinyman Pool chip-ALGO token in your wallet ASA ID: 388619917. You must hold this for at least 24 Hours."

	ErrNoEditDuringCommitment = "You cannot edit after commitment has begin"
	ErrAlreadyRegistered      = "you have already registered"
)
