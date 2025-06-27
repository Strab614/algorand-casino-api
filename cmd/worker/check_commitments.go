package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/algo-casino/payapi"
)

// returns eligible commitments, length of all total commitments and error (on failure)
func getCommitmentsForStakingPeriod(ctx context.Context, app *payapi.App, id int) (map[string]*payapi.StakingCommitment, int, error) {
	// get all commitments for this period
	stakingCommitments, err := app.StakingCommitmentService.FindStakingCommitments(ctx, payapi.StakingCommitmentFilter{StakingPeriodId: &id})
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to get staking commitments for staking period %d. err: %v\n", id, err)
		return nil, 0, err
	}

	// exit if no commitments
	if len(stakingCommitments) <= 0 {
		log.Printf("Staking Period: %d has no commitments!\n", id)
		return nil, 0, err
	}

	// initialize map
	commitmentsMap := make(map[string]*payapi.StakingCommitment)

	// put slice values into map
	for _, s := range stakingCommitments {
		// only add eligible records
		if s.Eligible {
			commitmentsMap[s.AlgorandAddress] = s
		}
	}

	return commitmentsMap, len(stakingCommitments), nil
}

func CheckCommitments(ctx context.Context, app *payapi.App, stakingPeriodId int) {
	eligibleCommitments, totalLength, err := getCommitmentsForStakingPeriod(ctx, app, stakingPeriodId)
	if err != nil {
		return
	}

	beforeEligibleLength := len(eligibleCommitments)

	chipHolding, err := app.IndexerService.GetAccountsWithAsset(ctx, 388592191)
	if err != nil {
		msg := fmt.Sprintf("GetAccountsWithAsset() ASA ID: %d failed! err: %v\n", 388592191, err)
		app.NotifyService.Notify(ctx, msg)
		fmt.Print(msg)
		return
	}

	fmt.Printf("len(chipHolding): %v\n", len(chipHolding))

	for _, v := range chipHolding {
		if _, ok := eligibleCommitments[v.Address]; ok {
			c := eligibleCommitments[v.Address]

			if c.Eligible {
				if v.Amount < c.ChipCommitment {
					// current holding is less than promised amount
					msg := fmt.Sprintf("%s commited %d chips! current balance %d chips! removing from eligibility...\n", v.Address, c.ChipCommitment, v.Amount)
					// mark record as ineligible
					_, err = app.StakingCommitmentService.UpdateEligibility(ctx, c.ID, false)
					if err != nil {
						fmt.Printf("failed to make user %s ineligible for staking period %d\n", c.AlgorandAddress, stakingPeriodId)
					} else {
						app.NotifyService.Notify(ctx, msg)
						fmt.Print(msg)
					}
				}

				// if they don't have any liquidity commitment, just remove them becuase they don't need any further checks
				if c.LiquidityCommitment <= 0 &&
					c.LiquidityCommitmentV2 <= 0 &&
					c.CAlgoCommitment <= 0 &&
					c.TAlgoCommitment <= 0 &&
					c.MAlgoCommitment <= 0 &&
					c.XAlgoCommitment <= 0 {
					// remove them from the check map, they've already passed or been removed
					delete(eligibleCommitments, v.Address)
				}
			}
		}
	}

	lpHolding, err := app.IndexerService.GetAccountsWithAsset(ctx, 552665159)
	if err != nil {
		msg := fmt.Sprintf("GetAccountsWithAsset() ASA ID: %d failed! err: %v\n", 552665159, err)
		app.NotifyService.Notify(ctx, msg)
		fmt.Print(msg)
		return
	}

	fmt.Printf("len(lpHolding): %v\n", len(lpHolding))

	for _, v := range lpHolding {
		if _, ok := eligibleCommitments[v.Address]; ok {
			c := eligibleCommitments[v.Address]

			if c.Eligible {
				if v.Amount < c.LiquidityCommitment {
					// current holding is less than promised amount
					msg := fmt.Sprintf("%s commited %d LP tokens! current balance %d LP tokens! removing from eligibility...\n", v.Address, c.LiquidityCommitment, v.Amount)
					// mark record as ineligible
					_, err = app.StakingCommitmentService.UpdateEligibility(ctx, c.ID, false)
					if err != nil {
						fmt.Printf("failed to make user %s ineligible for staking period %d\n", c.AlgorandAddress, stakingPeriodId)
					} else {
						app.NotifyService.Notify(ctx, msg)
						fmt.Print(msg)
					}
				}

				// only remove if they dont have any v2 LP commitment or CTMX
				if c.LiquidityCommitmentV2 <= 0 &&
					c.CAlgoCommitment <= 0 &&
					c.TAlgoCommitment <= 0 &&
					c.MAlgoCommitment <= 0 &&
					c.XAlgoCommitment <= 0 {
					// remove from list, we've checked this addr
					delete(eligibleCommitments, v.Address)
				}
			}
		}
	}

	lpHolding2, err := app.IndexerService.GetAccountsWithAsset(ctx, 1002609713)
	if err != nil {
		msg := fmt.Sprintf("GetAccountsWithAsset() ASA ID: %d failed! err: %v\n", 1002609713, err)
		app.NotifyService.Notify(ctx, msg)
		fmt.Print(msg)
		return
	}

	fmt.Printf("len(lpHolding2): %v\n", len(lpHolding2))

	for _, v := range lpHolding2 {
		if _, ok := eligibleCommitments[v.Address]; ok {
			c := eligibleCommitments[v.Address]

			if c.Eligible {
				if v.Amount < c.LiquidityCommitmentV2 {
					// current holding is less than promised amount
					msg := fmt.Sprintf("%s commited %d LP V2 tokens! current balance %d LP V2 tokens! removing from eligibility...\n", v.Address, c.LiquidityCommitmentV2, v.Amount)
					// mark record as ineligible
					_, err = app.StakingCommitmentService.UpdateEligibility(ctx, c.ID, false)
					if err != nil {
						fmt.Printf("failed to make user %s ineligible for staking period %d\n", c.AlgorandAddress, stakingPeriodId)
					} else {
						app.NotifyService.Notify(ctx, msg)
						fmt.Print(msg)
					}
				}

				// only remove if they dont have any CTMX commitment
				if c.CAlgoCommitment <= 0 &&
					c.TAlgoCommitment <= 0 &&
					c.MAlgoCommitment <= 0 &&
					c.XAlgoCommitment <= 0 {
					// remove from list, we've checked this addr
					delete(eligibleCommitments, v.Address)
				}
			}
		}
	}

	cAlgoHolding, err := app.IndexerService.GetAccountsWithAsset(ctx, 2562903034)
	if err != nil {
		msg := fmt.Sprintf("GetAccountsWithAsset() ASA ID: %d failed! err: %v\n", 2562903034, err)
		app.NotifyService.Notify(ctx, msg)
		fmt.Print(msg)
		return
	}

	fmt.Printf("len(cAlgoHolding): %v\n", len(cAlgoHolding))

	for _, v := range cAlgoHolding {
		if _, ok := eligibleCommitments[v.Address]; ok {
			c := eligibleCommitments[v.Address]

			if c.Eligible {
				if v.Amount < c.CAlgoCommitment {
					// current holding is less than promised amount
					msg := fmt.Sprintf("%s commited %d cALGO/chip tokens! current balance %d cALGO/chip tokens! removing from eligibility...\n", v.Address, c.LiquidityCommitmentV2, v.Amount)
					// mark record as ineligible
					_, err = app.StakingCommitmentService.UpdateEligibility(ctx, c.ID, false)
					if err != nil {
						fmt.Printf("failed to make user %s ineligible for staking period %d\n", c.AlgorandAddress, stakingPeriodId)
					} else {
						app.NotifyService.Notify(ctx, msg)
						fmt.Print(msg)
					}
				}

				// only remove if they dont have any TMX commitment
				if c.TAlgoCommitment <= 0 &&
					c.MAlgoCommitment <= 0 &&
					c.XAlgoCommitment <= 0 {
					// remove from list, we've checked this addr
					delete(eligibleCommitments, v.Address)
				}
			}
		}
	}

	tAlgoHolding, err := app.IndexerService.GetAccountsWithAsset(ctx, 2545480441)
	if err != nil {
		msg := fmt.Sprintf("GetAccountsWithAsset() ASA ID: %d failed! err: %v\n", 2545480441, err)
		app.NotifyService.Notify(ctx, msg)
		fmt.Print(msg)
		return
	}

	fmt.Printf("len(tAlgoHolding): %v\n", len(tAlgoHolding))

	for _, v := range tAlgoHolding {
		if _, ok := eligibleCommitments[v.Address]; ok {
			c := eligibleCommitments[v.Address]

			if c.Eligible {
				if v.Amount < c.TAlgoCommitment {
					// current holding is less than promised amount
					msg := fmt.Sprintf("%s commited %d tALGO/chip tokens! current balance %d tALGO/chip tokens! removing from eligibility...\n", v.Address, c.LiquidityCommitmentV2, v.Amount)
					// mark record as ineligible
					_, err = app.StakingCommitmentService.UpdateEligibility(ctx, c.ID, false)
					if err != nil {
						fmt.Printf("failed to make user %s ineligible for staking period %d\n", c.AlgorandAddress, stakingPeriodId)
					} else {
						app.NotifyService.Notify(ctx, msg)
						fmt.Print(msg)
					}
				}

				// only remove if they dont have any MX commitment
				if c.MAlgoCommitment <= 0 &&
					c.XAlgoCommitment <= 0 {
					// remove from list, we've checked this addr
					delete(eligibleCommitments, v.Address)
				}
			}
		}
	}

	mAlgoHolding, err := app.IndexerService.GetAccountsWithAsset(ctx, 2536627349)
	if err != nil {
		msg := fmt.Sprintf("GetAccountsWithAsset() ASA ID: %d failed! err: %v\n", 2536627349, err)
		app.NotifyService.Notify(ctx, msg)
		fmt.Print(msg)
		return
	}

	fmt.Printf("len(mAlgoHolding): %v\n", len(mAlgoHolding))

	for _, v := range mAlgoHolding {
		if _, ok := eligibleCommitments[v.Address]; ok {
			c := eligibleCommitments[v.Address]

			if c.Eligible {
				if v.Amount < c.MAlgoCommitment {
					// current holding is less than promised amount
					msg := fmt.Sprintf("%s commited %d mALGO/chip tokens! current balance %d mALGO/chip tokens! removing from eligibility...\n", v.Address, c.LiquidityCommitmentV2, v.Amount)
					// mark record as ineligible
					_, err = app.StakingCommitmentService.UpdateEligibility(ctx, c.ID, false)
					if err != nil {
						fmt.Printf("failed to make user %s ineligible for staking period %d\n", c.AlgorandAddress, stakingPeriodId)
					} else {
						app.NotifyService.Notify(ctx, msg)
						fmt.Print(msg)
					}
				}

				// only remove if they dont have any X commitment
				if c.XAlgoCommitment <= 0 {
					// remove from list, we've checked this addr
					delete(eligibleCommitments, v.Address)
				}
			}
		}
	}

	xAlgoHolding, err := app.IndexerService.GetAccountsWithAsset(ctx, 2520645026)
	if err != nil {
		msg := fmt.Sprintf("GetAccountsWithAsset() ASA ID: %d failed! err: %v\n", 2520645026, err)
		app.NotifyService.Notify(ctx, msg)
		fmt.Print(msg)
		return
	}

	fmt.Printf("len(xAlgoHolding): %v\n", len(xAlgoHolding))

	for _, v := range xAlgoHolding {
		if _, ok := eligibleCommitments[v.Address]; ok {
			c := eligibleCommitments[v.Address]

			if c.Eligible {
				if v.Amount < c.XAlgoCommitment {
					// current holding is less than promised amount
					msg := fmt.Sprintf("%s commited %d mALGO/chip tokens! current balance %d mALGO/chip tokens! removing from eligibility...\n", v.Address, c.LiquidityCommitmentV2, v.Amount)
					// mark record as ineligible
					_, err = app.StakingCommitmentService.UpdateEligibility(ctx, c.ID, false)
					if err != nil {
						fmt.Printf("failed to make user %s ineligible for staking period %d\n", c.AlgorandAddress, stakingPeriodId)
					} else {
						app.NotifyService.Notify(ctx, msg)
						fmt.Print(msg)
					}
				}

				// remove from list, we've checked this addr
				delete(eligibleCommitments, v.Address)
			}
		}
	}

	afterEligibleLength := len(eligibleCommitments)

	fmt.Printf("len(totalCommitments): %d\n", totalLength)
	fmt.Printf("len(eligibleCommitments)(should be zero): %d\n", afterEligibleLength)

	// print any straglers, there shouldn't be any!
	for _, v := range eligibleCommitments {
		fmt.Printf("v.AlgorandAddress: %v said they commited %d chips and %d liquidity, but it was a lie!\n", v.AlgorandAddress, v.ChipCommitment, v.LiquidityCommitment)
		_, err = app.StakingCommitmentService.UpdateEligibility(ctx, v.ID, false)
		if err != nil {
			fmt.Printf("failed to make user %s ineligible for staking period %d\n", v.AlgorandAddress, stakingPeriodId)
		} else {
			msg := fmt.Sprintf("%s commited %d chips! %d LPv1 %d LPv2 but wasn not present in any! removed from eligibility...\n", v.AlgorandAddress, v.ChipCommitment, v.LiquidityCommitment, v.LiquidityCommitmentV2)
			app.NotifyService.Notify(ctx, msg)
			fmt.Print(msg)
		}
	}

	msg := fmt.Sprintf("Completed house staking eligiblity check for period %d (%d/%d) total commitments\n", stakingPeriodId, beforeEligibleLength-afterEligibleLength, totalLength)
	log.Print(msg)
	app.NotifyService.Notify(ctx, msg)
}
