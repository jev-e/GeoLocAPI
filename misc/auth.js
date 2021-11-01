
const authtoken = process.env.TOKEN

//Check token header with server token
function tokenAuth(token){
    return (token === authtoken)
}

module.exports=tokenAuth;