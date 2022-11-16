const express         = require("express");
const { param, body,  } = require("express-validator");
const lib             = require("../lib");
const auth            = require("../controllers/Auth");
const Controller      = require("../controllers/Project");


const router = module.exports = express.Router({ mergeParams: true });


// List all --------------------------------------------------------------------
router.get(
    "/",
    auth.requirePermission("projects_list"),
    (req, res, next) => Controller.getAll(lib.getFindOptions(req))
        .then(data => res.json(data))
        .catch(next)
);

// Get one by ID ---------------------------------------------------------------
router.get(
    "/:id",
    lib.validateRequest(
        param("id", "The 'id' parameter must be integer").isInt(),
        param("id", "The 'id' parameter must be a positive integer").toInt().custom(x => x > 0)
    ),
    (req, res, next) => Controller.getOne(+req.params?.id)
    .then(data => {
        auth.requestPermission("projects_view", req, req.user?.id === data.creatorId)
        res.json(data)
    })
    .catch(next)
);

// Update ----------------------------------------------------------------------
router.put(
    "/:id",
    express.json(),
    lib.validateRequest(
        param("id", "The 'id' parameter must be integer").isInt(),
        param("id", "The 'id' parameter must be a positive integer").toInt().custom(x => x > 0),
        body("name").optional().notEmpty(),
        body("description").optional().notEmpty()
    ),
    (req, res, next) => Controller.update(+req.params?.id, req.body, { user: req.user })
        .then(data => {
            auth.requestPermission("projects_update", req, req.user?.id === data.creatorId)
            res.json(data)
        })
        .catch(next)
);

// Create ----------------------------------------------------------------------
router.post(
    "/",
    express.json(),
    auth.requireAuth(),
    auth.requirePermission("projects_create"),
    lib.validateRequest(
        body("name").exists(),
        body("description").exists()
    ),
    (req, res, next) => {
        Controller.create({ ...req.body, creatorId: req.user.id }, { user: req.user })
        .then(data => res.json(data))
        .catch(next)
    }
);

// Delete ----------------------------------------------------------------------
router.delete(
    "/:id",
    lib.validateRequest(
        param("id", "The 'id' parameter must be an integer").isInt(),
        param("id", "The 'id' parameter must be a positive integer").toInt().custom(x => x > 0),
    ),
    (req, res, next) => Controller.getOne(+req.params?.id)
        .then(data => {
            auth.requestPermission("projects_delete", req, req.user?.id === data.creatorId)
            return Controller.destroy(+req.params?.id, { user: req.user })
        })
        .then(data => res.json(data))
        .catch(next)
);