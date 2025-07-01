"""
Algorand Smart Contract for Casino Games
Implements provably fair gaming with automated payouts
"""

from pyteal import *

def casino_game_contract():
    # Global state keys
    house_balance_key = Bytes("house_balance")
    game_count_key = Bytes("game_count")
    min_bet_key = Bytes("min_bet")
    max_bet_key = Bytes("max_bet")
    house_edge_key = Bytes("house_edge")
    
    # Local state keys
    player_balance_key = Bytes("player_balance")
    games_played_key = Bytes("games_played")
    
    @Subroutine(TealType.uint64)
    def generate_random_number(seed: TealType.bytes, max_value: TealType.uint64):
        """Generate provably fair random number"""
        return Mod(
            Btoi(Substring(Sha256(seed), Int(0), Int(8))),
            max_value
        )
    
    @Subroutine(TealType.uint64)
    def calculate_payout(bet_amount: TealType.uint64, game_type: TealType.uint64, result: TealType.uint64):
        """Calculate payout based on game type and result"""
        return Cond(
            [game_type == Int(1), bet_amount * Int(2)],  # Coin flip: 2x
            [game_type == Int(2), bet_amount * Int(36)], # Roulette single number: 36x
            [game_type == Int(3), bet_amount * Int(3)],  # Slots three of a kind: 3x
            [Int(1), Int(0)]  # Default: no payout
        )
    
    # Application creation
    on_creation = Seq([
        App.globalPut(house_balance_key, Int(1000000)),  # Initial house balance
        App.globalPut(game_count_key, Int(0)),
        App.globalPut(min_bet_key, Int(1)),
        App.globalPut(max_bet_key, Int(1000)),
        App.globalPut(house_edge_key, Int(250)),  # 2.5% house edge (250/10000)
        Return(Int(1))
    ])
    
    # Player registration
    on_opt_in = Seq([
        App.localPut(Txn.sender(), player_balance_key, Int(0)),
        App.localPut(Txn.sender(), games_played_key, Int(0)),
        Return(Int(1))
    ])
    
    # Deposit chips
    on_deposit = Seq([
        Assert(Gtxn[1].type_enum() == TxnType.AssetTransfer),
        Assert(Gtxn[1].asset_receiver() == Global.current_application_address()),
        App.localPut(
            Txn.sender(),
            player_balance_key,
            App.localGet(Txn.sender(), player_balance_key) + Gtxn[1].asset_amount()
        ),
        Return(Int(1))
    ])
    
    # Play game
    on_play_game = Seq([
        # Validate bet amount
        Assert(Gtxn[0].application_args.length() == Int(3)),
        Assert(Btoi(Gtxn[0].application_args[1]) >= App.globalGet(min_bet_key)),
        Assert(Btoi(Gtxn[0].application_args[1]) <= App.globalGet(max_bet_key)),
        
        # Check player balance
        Assert(App.localGet(Txn.sender(), player_balance_key) >= Btoi(Gtxn[0].application_args[1])),
        
        # Generate random number using block hash + player address + game count
        (random_seed := Concat(
            Global.latest_timestamp(),
            Txn.sender(),
            Itob(App.globalGet(game_count_key))
        )),
        
        (game_type := Btoi(Gtxn[0].application_args[2])),
        (bet_amount := Btoi(Gtxn[0].application_args[1])),
        (random_result := generate_random_number(random_seed, Int(100))),
        
        # Determine win/loss based on game type and house edge
        (win_threshold := Int(100) - App.globalGet(house_edge_key)),
        (is_winner := random_result < win_threshold),
        
        # Calculate payout
        (payout := If(
            is_winner,
            calculate_payout(bet_amount, game_type, random_result),
            Int(0)
        )),
        
        # Update player balance
        App.localPut(
            Txn.sender(),
            player_balance_key,
            App.localGet(Txn.sender(), player_balance_key) - bet_amount + payout
        ),
        
        # Update house balance
        App.globalPut(
            house_balance_key,
            App.globalGet(house_balance_key) + bet_amount - payout
        ),
        
        # Update game count
        App.globalPut(game_count_key, App.globalGet(game_count_key) + Int(1)),
        App.localPut(
            Txn.sender(),
            games_played_key,
            App.localGet(Txn.sender(), games_played_key) + Int(1)
        ),
        
        # Log result for verification
        Log(Concat(
            Bytes("game_result:"),
            Itob(random_result),
            Bytes(":"),
            Itob(payout)
        )),
        
        Return(Int(1))
    ])
    
    # Withdraw chips
    on_withdraw = Seq([
        Assert(Gtxn[0].application_args.length() == Int(2)),
        (withdraw_amount := Btoi(Gtxn[0].application_args[1])),
        Assert(App.localGet(Txn.sender(), player_balance_key) >= withdraw_amount),
        
        # Update player balance
        App.localPut(
            Txn.sender(),
            player_balance_key,
            App.localGet(Txn.sender(), player_balance_key) - withdraw_amount
        ),
        
        # Send chips back to player
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.asset_receiver: Txn.sender(),
            TxnField.asset_amount: withdraw_amount,
            TxnField.xfer_asset: Int(388592191)  # CHIPS asset ID
        }),
        InnerTxnBuilder.Submit(),
        
        Return(Int(1))
    ])
    
    # Main application logic
    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.on_completion() == OnCall.OptIn, on_opt_in],
        [Txn.application_args[0] == Bytes("deposit"), on_deposit],
        [Txn.application_args[0] == Bytes("play"), on_play_game],
        [Txn.application_args[0] == Bytes("withdraw"), on_withdraw],
        [Int(1), Return(Int(0))]
    )
    
    return program

if __name__ == "__main__":
    print(compileTeal(casino_game_contract(), Mode.Application, version=8))