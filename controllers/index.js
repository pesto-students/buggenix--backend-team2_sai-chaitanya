import {registerUser,loginUser,handleRefreshToken,handleSocials,handleLogout} from './auth/auth.js';
import {inviteNewUser,getAllUsers,deleteUser,changeRoleOfUser} from './users/users.js';

export {
    // auth
    registerUser,
    loginUser,
    handleRefreshToken,
    handleSocials,
    handleLogout,

    // users
    inviteNewUser,
    getAllUsers,
    deleteUser,
    changeRoleOfUser
}