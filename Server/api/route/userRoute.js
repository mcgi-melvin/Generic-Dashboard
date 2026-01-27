const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole, checkPermission } = require('../middleware/roleMiddleware');

router.get('/',
    authMiddleware,
    checkPermission('manage_users'),
    userController.getAllUsers
);

router.get('/:id',
    authMiddleware,
    checkPermission('manage_users'),
    userController.getUserById
);

router.put('/:id',
    authMiddleware,
    checkPermission('manage_users'),
    userController.updateUser
);

router.delete('/:id',
    authMiddleware,
    checkRole('admin'),
    userController.deleteUser
);

module.exports = router;