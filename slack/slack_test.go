package slack_test

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/algo-casino/payapi/slack"
)

func TestSlackNotify(t *testing.T) {
	s := slack.NewNotifyService("https://hooks.slack.com/services/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")
	if s == nil {
		t.Error("failed to initialize slack service")
	}

	// actually send a test message
	err := s.Notify(context.Background(), fmt.Sprintf("Testing SlackService.Notify() %v", time.Now().Format(time.UnixDate)))
	if err != nil {
		t.Errorf("failed to send message! err: %v\n", err)
	}
}
