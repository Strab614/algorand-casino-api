package stake

import (
	"context"
	"database/sql"
	"time"
)

// package used to interact with a running stake instance

type (
	UserProfile struct {
		// How many individual bet's made in total?
		BetCount uint64 `json:"betCount"`
		// How many wins?
		WinCount uint64 `json:"winCount"`
		// How many chips have been bet in total?
		BetTotal float32 `json:"betTotal"`
		// How much profit (or losses has user made?)
		ProfitTotal float32 `json:"profitTotal"`
		// Max profit made on a single game/bet
		ProfitMax float32 `json:"profitMax"`
	}

	LeaderboardEntry struct {
		Rank     int     `json:"rank"`
		UserID   uint64  `json:"userId"`
		Name     string  `json:"name"`
		BetCount uint64  `json:"betCount"`
		BetTotal float32 `json:"betTotal"`
	}

	LeaderboardEntryResult struct {
		LastUpdatedAt time.Time           `json:"lastUpdatedAt"`
		Entries       []*LeaderboardEntry `json:"entries"`
	}

	StakeService struct {
		db *sql.DB

		leaderboard            []*LeaderboardEntry
		leaderboardLastUpdated time.Time
	}
)

func NewStakeService(db *sql.DB) *StakeService {
	return &StakeService{
		db: db,
	}
}

func (s *StakeService) GetUserProfileByAddress(ctx context.Context, algorandAddress string) (*UserProfile, error) {
	up := &UserProfile{}

	sql := "SELECT COUNT(*) AS bet_count, IFNULL(SUM(IF(win > bet,1,0)),0) AS win_count, IFNULL(SUM(bet),0) AS bet_total, IFNULL(SUM(win-bet),0) AS profit_total, IFNULL(MAX(win-bet),0) AS profit_max FROM `games` WHERE `games`.`account_id` = (SELECT id FROM users WHERE algorand_address = ?) AND `games`.`account_id` IS NOT NULL AND `games`.`status` = 1"

	err := s.db.QueryRowContext(ctx, sql, algorandAddress).Scan(&up.BetCount, &up.WinCount, &up.BetTotal, &up.ProfitTotal, &up.ProfitMax)
	if err != nil {
		return nil, err
	}

	return up, nil
}

func (s *StakeService) GetTopTenWagered(ctx context.Context, startTime, endTime time.Time) (*LeaderboardEntryResult, error) {
	nowTime := time.Now().UTC()

	if !s.leaderboardLastUpdated.IsZero() && s.leaderboardLastUpdated.Add(12*time.Hour).After(nowTime) {
		return &LeaderboardEntryResult{
			nowTime,
			s.leaderboard,
		}, nil
	}

	sql := "select users.id, users.name, COUNT(DISTINCT games.id) AS bet_count,IFNULL(SUM(games.bet),0) AS bet_total from `users` left join `accounts` on `accounts`.`user_id` = `users`.`id` and `accounts`.`updated_at` >= ? left join `games` on `accounts`.`id` = `games`.`account_id` and `games`.`status` = 1 and `games`.`created_at` between ? and ? where `users`.`status` = ? and `users`.`last_login_at` >= ? - INTERVAL 6 MONTH group by `users`.`id`, `name`, `hide_profit` order by bet_total desc limit 10 offset 0"

	// max 15 seconds so we don't lock up the entire casino forever
	queryCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(queryCtx, sql, startTime, startTime, endTime, 0, startTime)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	entries := make([]*LeaderboardEntry, 0)

	index := 1

	for rows.Next() {
		var entry LeaderboardEntry

		err = rows.Scan(&entry.UserID, &entry.Name, &entry.BetCount, &entry.BetTotal)
		if err != nil {
			return nil, err
		}

		entry.Rank = index

		entries = append(entries, &entry)

		index++
	}

	// update local cache
	s.leaderboardLastUpdated = nowTime
	s.leaderboard = entries

	return &LeaderboardEntryResult{
		nowTime,
		s.leaderboard,
	}, nil
}

func (s *StakeService) GetGrossProfitForRange(ctx context.Context, startTime, endTime time.Time) (float64, error) {
	sql := `
		select SUM(bet) - SUM(win) AS ggr from games
		where games.status = 1
		and games.created_at between ? and ?
		and exists (select * from accounts where games.account_id = accounts.id
		and exists (select * from users where accounts.user_id = users.id))
		limit 1
`
	var profit float64

	// max 15 seconds so we don't lock up the entire casino forever
	queryCtx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	err := s.db.QueryRowContext(queryCtx, sql, startTime, endTime).Scan(&profit)
	if err != nil {
		return 0, err
	}

	return profit, nil
}
