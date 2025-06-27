package chip

import (
	"context"
	"fmt"

	"github.com/algo-casino/payapi"
	"github.com/algo-casino/payapi/algo"
)

var _ payapi.StakingNftService = (*StakingNftService)(nil)

type (
	StakingNftService struct {
		IndexerService           algo.IndexerService
		StakingCommitmentService payapi.StakingCommitmentService
		addressDenylist          []string
	}

	autoStakeEntry struct {
		LiquidityCommitment   uint64
		LiquidityCommitmentV2 uint64

		// new liquid targets
		CAlgoCommitment uint64
		TAlgoCommitment uint64
		MAlgoCommitment uint64
		XAlgoCommitment uint64
	}
)

// checks if an address is contained in the nft blacklist
// if yes, we should ignore it
func (s *StakingNftService) isAddressDenied(address string) bool {
	for _, v := range s.addressDenylist {
		if v == address {
			return true
		}
	}

	return false
}

func NewStakingNftService(addressDenylist []string) *StakingNftService {
	return &StakingNftService{
		addressDenylist: addressDenylist,
	}
}

func (s *StakingNftService) CreateAutoStake(ctx context.Context, stakingPeriodId int) error {
	// bad wording, is actually who has more than 0..
	nftHolders, err := s.IndexerService.GetAccountsWithMinimumAssetBalance(context.TODO(), 1032365802, 0)
	if err != nil {
		return err
	}

	holders := 0

	as := make(map[string]autoStakeEntry, 0)

	for _, mah := range nftHolders {
		if mah.Amount > 0 {
			if s.isAddressDenied(mah.Address) {
				fmt.Printf("Holder %s is on denylist, ignored\n", mah.Address)
				continue
			}

			fmt.Printf("%s holds %d nft\n", mah.Address, mah.Amount)

			as[mah.Address] = autoStakeEntry{
				LiquidityCommitment:   0,
				LiquidityCommitmentV2: 0,
				CAlgoCommitment:       0,
				TAlgoCommitment:       0,
				MAlgoCommitment:       0,
				XAlgoCommitment:       0,
			}
			holders++
		}
	}

	fmt.Printf("total auto stake %d\n", len(as))

	lpHolding, err := s.IndexerService.GetAccountsWithAsset(context.Background(), 552665159)
	if err != nil {
		return err
	}

	for _, v := range lpHolding {
		if v.Amount <= 0 {
			continue
		}

		if _, ok := as[v.Address]; ok {
			// add their v1 token to the list
			as[v.Address] = autoStakeEntry{
				LiquidityCommitment:   v.Amount,
				LiquidityCommitmentV2: as[v.Address].LiquidityCommitmentV2,
				CAlgoCommitment:       as[v.Address].CAlgoCommitment,
				TAlgoCommitment:       as[v.Address].TAlgoCommitment,
				MAlgoCommitment:       as[v.Address].MAlgoCommitment,
				XAlgoCommitment:       as[v.Address].XAlgoCommitment,
			}
		}
	}

	lpHoldingV2, err := s.IndexerService.GetAccountsWithAsset(context.Background(), 1002609713)
	if err != nil {
		return err
	}

	for _, v := range lpHoldingV2 {
		if v.Amount <= 0 {
			continue
		}

		if _, ok := as[v.Address]; ok {
			// add their v1 token to the list
			as[v.Address] = autoStakeEntry{
				LiquidityCommitment:   as[v.Address].LiquidityCommitment,
				LiquidityCommitmentV2: v.Amount,
				CAlgoCommitment:       as[v.Address].CAlgoCommitment,
				TAlgoCommitment:       as[v.Address].TAlgoCommitment,
				MAlgoCommitment:       as[v.Address].MAlgoCommitment,
				XAlgoCommitment:       as[v.Address].XAlgoCommitment,
			}
		}
	}

	cAlgoHolding, err := s.IndexerService.GetAccountsWithAsset(context.Background(), 2562903034)
	if err != nil {
		return err
	}

	for _, v := range cAlgoHolding {
		if v.Amount <= 0 {
			continue
		}

		if _, ok := as[v.Address]; ok {
			// add their v1 token to the list
			as[v.Address] = autoStakeEntry{
				LiquidityCommitment:   as[v.Address].LiquidityCommitment,
				LiquidityCommitmentV2: as[v.Address].LiquidityCommitmentV2,
				CAlgoCommitment:       v.Amount,
				TAlgoCommitment:       as[v.Address].TAlgoCommitment,
				MAlgoCommitment:       as[v.Address].MAlgoCommitment,
				XAlgoCommitment:       as[v.Address].XAlgoCommitment,
			}
		}
	}

	tAlgoHolding, err := s.IndexerService.GetAccountsWithAsset(context.Background(), 2545480441)
	if err != nil {
		return err
	}

	for _, v := range tAlgoHolding {
		if v.Amount <= 0 {
			continue
		}

		if _, ok := as[v.Address]; ok {
			// add their v1 token to the list
			as[v.Address] = autoStakeEntry{
				LiquidityCommitment:   as[v.Address].LiquidityCommitment,
				LiquidityCommitmentV2: as[v.Address].LiquidityCommitmentV2,
				CAlgoCommitment:       as[v.Address].CAlgoCommitment,
				TAlgoCommitment:       v.Amount,
				MAlgoCommitment:       as[v.Address].MAlgoCommitment,
				XAlgoCommitment:       as[v.Address].XAlgoCommitment,
			}
		}
	}

	mAlgoHolding, err := s.IndexerService.GetAccountsWithAsset(context.Background(), 2536627349)
	if err != nil {
		return err
	}

	for _, v := range mAlgoHolding {
		if v.Amount <= 0 {
			continue
		}

		if _, ok := as[v.Address]; ok {
			// add their v1 token to the list
			as[v.Address] = autoStakeEntry{
				LiquidityCommitment:   as[v.Address].LiquidityCommitment,
				LiquidityCommitmentV2: as[v.Address].LiquidityCommitmentV2,
				CAlgoCommitment:       as[v.Address].CAlgoCommitment,
				TAlgoCommitment:       as[v.Address].TAlgoCommitment,
				MAlgoCommitment:       v.Amount,
				XAlgoCommitment:       as[v.Address].XAlgoCommitment,
			}
		}
	}

	xAlgoHolding, err := s.IndexerService.GetAccountsWithAsset(context.Background(), 2520645026)
	if err != nil {
		return err
	}

	for _, v := range xAlgoHolding {
		if v.Amount <= 0 {
			continue
		}

		if _, ok := as[v.Address]; ok {
			// add their v1 token to the list
			as[v.Address] = autoStakeEntry{
				LiquidityCommitment:   as[v.Address].LiquidityCommitment,
				LiquidityCommitmentV2: as[v.Address].LiquidityCommitmentV2,
				CAlgoCommitment:       as[v.Address].CAlgoCommitment,
				TAlgoCommitment:       as[v.Address].TAlgoCommitment,
				MAlgoCommitment:       as[v.Address].MAlgoCommitment,
				XAlgoCommitment:       v.Amount,
			}
		}
	}

	currentCommitments, err := s.StakingCommitmentService.FindStakingCommitments(context.TODO(), payapi.StakingCommitmentFilter{StakingPeriodId: &stakingPeriodId})
	if err != nil {
		fmt.Printf("err: %v\n", err)
		return err
	}

	fmt.Printf("len(currentCommitments): %d\n", len(currentCommitments))

	checkCommitment := func(address string) *payapi.StakingCommitment {
		for _, sc := range currentCommitments {
			if sc.AlgorandAddress == address {
				return sc
			}
		}

		return nil
	}

	for k, ase := range as {
		//fmt.Printf("Address: %s ase: %v\n", k, ase)

		// skip if there's nothing to commit
		if ase.LiquidityCommitment == 0 && ase.LiquidityCommitmentV2 == 0 && ase.CAlgoCommitment == 0 && ase.TAlgoCommitment == 0 && ase.MAlgoCommitment == 0 && ase.XAlgoCommitment == 0 {
			fmt.Printf("k: %v has zero LP, skipping\n", k)
			continue
		}

		cc := checkCommitment(k)
		if cc != nil {
			fmt.Printf("k: %v already has a commitment, updating\n", k)
			// already has a commitment
			nsc := &payapi.StakingCommitment{
				ID:                    cc.ID,
				StakingPeriodID:       cc.StakingPeriodID,
				ChipCommitment:        cc.ChipCommitment,
				LiquidityCommitment:   ase.LiquidityCommitment,
				LiquidityCommitmentV2: ase.LiquidityCommitmentV2,
				CAlgoCommitment:       ase.CAlgoCommitment,
				TAlgoCommitment:       ase.TAlgoCommitment,
				MAlgoCommitment:       ase.MAlgoCommitment,
				XAlgoCommitment:       ase.XAlgoCommitment,
			}
			err := s.StakingCommitmentService.UpdateStakingCommitment(context.TODO(), nsc)
			if err != nil {
				fmt.Printf("err: %v\n", err)
			}
		} else {
			fmt.Printf("k: %v does not have a commitment\n", k)

			nsc := &payapi.StakingCommitment{
				StakingPeriodID:       stakingPeriodId,
				AlgorandAddress:       k,
				ChipCommitment:        0,
				LiquidityCommitment:   ase.LiquidityCommitment,
				LiquidityCommitmentV2: ase.LiquidityCommitmentV2,
				CAlgoCommitment:       ase.CAlgoCommitment,
				TAlgoCommitment:       ase.TAlgoCommitment,
				MAlgoCommitment:       ase.MAlgoCommitment,
				XAlgoCommitment:       ase.XAlgoCommitment,
			}

			err := s.StakingCommitmentService.CreateStakingCommitment(context.TODO(), nsc)
			if err != nil {
				fmt.Printf("err: %v\n", err)
			}
		}
	}

	currentCommitments, err = s.StakingCommitmentService.FindStakingCommitments(context.TODO(), payapi.StakingCommitmentFilter{StakingPeriodId: &stakingPeriodId})
	if err != nil {
		fmt.Printf("err: %v\n", err)
		return err
	}

	fmt.Printf("len(currentCommitments): %d\n", len(currentCommitments))

	return nil
}
