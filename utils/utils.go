package utils

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/go-playground/validator/v10"
)

type (
	Validator struct {
		// use a single instance of Validate, it caches struct info
		validate *validator.Validate
	}
)

func NewValidator() *Validator {
	return &Validator{
		validate: validator.New(),
	}
}

// on success returns nil (no error)
// on failure returns array of errors (useful for front end consumers)

func (v Validator) Validate(i interface{}) error {
	err := v.validate.Struct(i)
	if err != nil {

		// this check is only needed when your code could produce
		// an invalid value for validation such as interface with nil
		// value most including myself do not usually have code like this.
		if _, ok := err.(*validator.InvalidValidationError); ok {
			fmt.Println(err)
			return err
		}

		// for _, err := range err.(validator.ValidationErrors) {

		// 	fmt.Println(err.Namespace())
		// 	fmt.Println(err.Field())
		// 	fmt.Println(err.StructNamespace())
		// 	fmt.Println(err.StructField())
		// 	fmt.Println(err.Tag())
		// 	fmt.Println(err.ActualTag())
		// 	fmt.Println(err.Kind())
		// 	fmt.Println(err.Type())
		// 	fmt.Println(err.Value())
		// 	fmt.Println(err.Param())
		// 	fmt.Println()
		// }

		// from here you can create your own error messages in whatever language you wish
		return err
	}

	return nil
}

func MustGetEnv(k string) string {
	s := os.Getenv(k)
	if s == "" {
		log.Panicf("failed to GetEnv() %s\n", s)
	}

	return s
}

func GetStartDayOfWeek(tm time.Time) time.Time { //get monday 00:00:00
	weekday := time.Duration(tm.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	year, month, day := tm.Date()
	currentZeroDay := time.Date(year, month, day, 0, 0, 0, 0, time.UTC)
	return currentZeroDay.Add(-1 * (weekday - 1) * 24 * time.Hour)
}
