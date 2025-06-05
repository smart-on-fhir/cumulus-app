// IMPORTANT!
// These the default users you get after the initial installation. Once the
// system is up and running you should invite other user (at least someone as)
// admin, and then delete these 3 default users!
export default [
    {
        id      : 1,
        role    : "user",
        email   : "user@cumulus.dev",
        name    : "Normal user",
        password: "User@12345"
    },
    {
        id      : 2,
        role    : "manager",
        email   : "manager@cumulus.dev",
        name    : "Manager",
        password: "Manager@12345"
    },
    {
        id      : 3,
        role    : "admin",
        email   : "admin@cumulus.dev",
        name    : "Admin",
        password: "Admin@12345"
    }
]
