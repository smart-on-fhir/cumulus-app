import config from "../../../config"

export default [
    {
        id      : 1,
        role    : "admin",
        email   : "admin@cumulus.test",
        name    : "Cumulus user",
        sid     : "admin_session_id",
        password: "Admin@12345",
    },
    {
        id      : 2,
        role    : "manager",
        email   : "manager@cumulus.test",
        name    : "Cumulus manager",
        sid     : "manager_session_id",
        password: "Manager@12345",
    },
    {
        id      : 3,
        role    : "user",
        email   : "user@cumulus.test",
        name    : "Cumulus user",
        sid     : "user_session_id",
        password: "User@12345",
    },

    // Recently invited
    {
        id       : 4,
        role     : "user",
        email    : "user4@cumulus.test",
        name     : "Recently invited user",
        sid      : null,
        password : null,
        invitedBy: "admin@cumulus.test",
        createdAt: Date.now() - 1000*60*60,
        activationCode: "test-activation-code"
    },

    // Accepted invitation
    {
        id       : 5,
        role     : "user",
        email    : "user5@cumulus.test",
        name     : "Recently activated user",
        sid      : null,
        password : "User5@12345",
        invitedBy: "admin@cumulus.test",
        createdAt: Date.now() - 1000*60*60,
        activationCode: "test-activation-code-2"
    },

    // Expired invitation
    {
        id       : 6,
        role     : "user",
        email    : "user6@cumulus.test",
        name     : "Expired user",
        sid      : null,
        password : null,
        invitedBy: "admin@cumulus.test",
        createdAt: new Date(Date.now() - 1000*60*60* (config.userInviteExpireAfterHours + 1)),
        activationCode: "test-activation-code-3"
    }
];
