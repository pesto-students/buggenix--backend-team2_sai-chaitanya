import {registerUser,loginUser,handleRefreshToken,handleSocials,handleLogout} from './auth/auth.js';
import {inviteNewUser,getAllUsers,deleteUser,changeRoleOfUser} from './users/users.js';
import {createProject,getProjects} from './project/project.js';

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
    changeRoleOfUser,

    // projects
    createProject,
    getProjects
}