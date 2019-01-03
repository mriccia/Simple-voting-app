const WS_ENDPOINT = __WS_API__;

let socket = new WebSocket(WS_ENDPOINT);
let votes= [];

const VotingService = {
    vote: function (vote) {
        console.log(vote);
        socket.send(JSON.stringify({
            message: "vote",
            vote: vote
        }));
    },
    updateResults: function(results){
        //Clear results
        this.state.voteResults.splice(0,this.state.voteResults.length);
        //Update with new values
        this.state.voteResults.push.apply(this.state.voteResults, results);
    },
    state: {
        voteResults: []
    }
};

socket.onmessage = (event) => {
    VotingService.updateResults(JSON.parse(event.data));
}
 
module.exports = VotingService;