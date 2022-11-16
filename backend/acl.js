const roles = {
    "guest"  : 0,
    "user"   : 1,
    "manager": 2,
    "owner"  : 3,
    "admin"  : 4
};

const ACL = {

    // ACTION : [ GUEST, USER, MANAGER, OWNER, ADMIN ]
    
    // NOTE:
    // - 0 means not allowed
    // - 1 means allowed
    // - empty means not applicable therefore not allowed (for example because
    //   the subject can't have owners)

    // users -------------------------------------------------------------------
    users_list               :[ 0, 0, 0,  , 1 ], // view all users
    users_view               :[ 0, 0, 0, 1, 1 ], // view single user
    users_create             :[ 0, 0, 0,  , 1 ], // create new user
    users_update             :[ 0, 0, 0, 1, 1 ], // update user
    users_delete             :[ 0, 0, 0, 0, 1 ], // delete user
    users_invite             :[ 0, 0, 0,  , 1 ], // invite new user
    users_activate           :[ 1, 1, 1,  , 1 ], // activate account from code
    users_check_activation   :[ 1, 1, 1,  , 1 ], // check activation code
    // -------------------------------------------------------------------------

    // projects ----------------------------------------------------------------
    projects_list            :[ 0, 1, 1,  , 1 ], // view all projects
    projects_view            :[ 0, 1, 1,  , 1 ], // view single project
    projects_create          :[ 0, 0, 1,  , 1 ], // create new project
    projects_update          :[ 0, 0, 1,  , 1 ], // update project
    projects_delete          :[ 0, 0, 1,  , 1 ], // delete project
    // -------------------------------------------------------------------------

    // views/graphs ------------------------------------------------------------
    views_list               :[ 0, 1, 1,  , 1 ], // view all graphs
    views_view               :[ 0, 1, 1,  , 1 ], // view one graph by id
    views_create             :[ 0, 0, 1,  , 1 ], // create new graph
    views_update             :[ 0, 0, 1,  , 1 ], // update graph by ID
    views_delete             :[ 0, 0, 1,  , 1 ], // delete graph by ID
    views_get_screenshot     :[ 0, 1, 1,  , 1 ], // view graph's thumbnail
    views_vote               :[ 0, 1, 1,  , 1 ], // rate a graph
    views_reset_rating       :[ 0, 0, 0,  , 1 ], // reset graph rating
    views_request_line_data  :[ 0, 1, 1,  , 1 ], // request line-level data
    // -------------------------------------------------------------------------

    // data sites --------------------------------------------------------------
    data_sites_list          :[ 0, 1, 1,  , 1 ], // view all data sites
    data_sites_view          :[ 0, 1, 1,  , 1 ], // view single data site by ID
    data_sites_create        :[ 0, 0, 1,  , 1 ], // create data site
    data_sites_update        :[ 0, 0, 1,  , 1 ], // update data site
    data_sites_delete        :[ 0, 0, 0,  , 1 ], // delete data site by ID
    // -------------------------------------------------------------------------

    // request groups ----------------------------------------------------------
    request_groups_list      :[ 0, 1, 1,  , 1 ], // view all request groups
    request_groups_view      :[ 0, 1, 1,  , 1 ], // view single request group
    request_groups_create    :[ 0, 0, 1,  , 1 ], // create request group
    request_groups_update    :[ 0, 0, 1,  , 1 ], // update request group
    request_groups_delete    :[ 0, 0, 0,  , 1 ], // delete request group by ID
    // -------------------------------------------------------------------------

    // data requests -----------------------------------------------------------
    data_request_list_views  :[ 0, 1, 1,  , 1 ], // list request views
    data_request_export_data :[ 0, 0, 1,  , 1 ], // export data
    data_request_refresh     :[ 0, 0, 1,  , 1 ], // fetch new subscription data
    data_request_insert      :[ 0, 0, 1,  , 1 ], // upload CSV
    data_request_api         :[ 0, 1, 1,  , 1 ], // query the api to build graphs
    data_request_list        :[ 0, 1, 1,  , 1 ], // list data requests
    data_request_view        :[ 0, 1, 1,  , 1 ], // view single data request
    data_request_create      :[ 0, 1, 1,  , 1 ], // create new data request
    data_request_update      :[ 0, 0, 1,  , 1 ], // update data request
    data_request_delete      :[ 0, 0, 0,  , 1 ], // delete data request
    // -------------------------------------------------------------------------

    // data --------------------------------------------------------------------
    data_create              :[ 0, 1, 1,  , 1 ], // create aggregate data
    data_update              :[ 0, 0, 1,  , 1 ], // update aggregate data
    data_read                :[ 0, 0, 1,  , 1 ], // read aggregate data
    // -------------------------------------------------------------------------

    // logs --------------------------------------------------------------------
    activity_list            :[ 0, 1, 1,  , 1 ], // browse activity logs
    logs_list                :[ 0, 0, 0,  , 1 ], // browse logs
    // -------------------------------------------------------------------------
};

Object.freeze(ACL);
Object.freeze(roles);


module.exports = {
    ACL,
    roles
};
