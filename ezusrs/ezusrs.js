/**
 * Easy Users (ezusrs) - v.1.0
 * Code by Miguel Ríos Marcos
 * 
 * A simple module designed for managing static users and roles
 * Designed for generalization of ...
 * The real strength of this module comes combined with the 'ezauth' module by creating automatic authorization based on roles
 * 
 * Dependencies : 'fs' and 'path'
 * License : MIT License
 */

const fs = require('fs');
const path = require('path');

/**
 * @typedef {Object} Privilege
 * @property {string} name of the privilege.
 */

/**
 * @type {Privilege[]}
 * @description An array storing all available privileges.
 */
let _privileges = [];

/**
 * @typedef {Object} Role
 * @property {string} name of the role.
 * @property {Privilege[]} privileges of the role.
 */ 

/**
 * @type {Role[]}
 * @description An array storing all available roles.
 */
let _roles = [];

/**
 * @typedef {Object} User
 * @property {string} name of the user.
 * @property {string} pswd of the user.
 * @property {Role[]} roles of the user.
 * @property {Privilege[]} privileges of the user.
 */

/**
 * @type {User[]}
 * @description An array storing all users.
 */
let _users = [];


// #region general
/**
 * Function to drop an entity (User, Role or Privilege) from a container
 * 
 * @param {User[] | Role[] | Privilege[]} entities to be dropped
 * @param {tipeof entities[]} container from where to be dropped
 */
function drop(entities, container){
    container = container.filter((current) => { !exists([current], entities) });
}

/**
 * Function to grant a privilege to an entity (User or Role).
 * 
 * @param {User | Role} entity which to grant the privileges.
 * @param {Privilege[]} privileges to be givven to that entity.
 */
function grant(entity, privileges){

    // Check if the privileges exist
    if(!exists(privileges, _privileges)){
        throw new Error(`Error: Privileges ${privileges} are not valid because they don't exist`);
    }

    // Grant the privileges to the user
    privileges.forEach((privilege) => {
        if(!exists([privilege], entity.privileges)){
            entity.privileges.push(privilege);
        }
    });
}

/**
 * Function to revoke a privilege from an entity (User or Role).
 * 
 * @param {User | Role} entity which to grant the privileges.
 * @param {Privilege[]} privileges to be givven to that entity.
 */
function revoke(entity, privileges){
    entity.privileges = entity.privileges.filter((privilege) => { !privileges.includes(privilege) });
}

/**
 * Function to check if a list of entinty (User, Role or Privilege) exisits whithin its container.
 * 
 * @param {User[] | Role[] | Privilege[]} entities which we want to check if exist.
 * @param {typeof entities[]} container in which that entity needs to be searched for.
 */
function exists(entities, container){
    return entities.every((entity) => {
        return container.every((contained) => {
            return contained.name != entity.name;
        });
    });
}
// #endregion

// #region  users
/**
 * Function to find a users by name, role.
 * 
 * @param {Object} criteria to use when finding users.
 * @param {string[]} [criteria.names] Array of names of the users to find.
 * @param {Role[]} [criteria.roles] Array of roles of the users to find.
 * @param {Privilege[]} [criteria.privileges] Array of privileges of the users to find.
 * 
 * @returns {User[]} Array of users found givven a name, role or privilege.
 */
function findUsers({ names, roles, privileges }){
    
    // Check which users are valid givven the criteria
    return _users.filter((user) => {
        return (
            (names && exists([user.name], names)) ||
            (roles && roles.any((role) => exists([role], user.roles))) ||
            (privileges && privileges.any((privilege) => exists([privilege], user.privileges)))
        );
    });
}

/**
 * Function to create a new user.
 * 
 * @param {Object} user An object containing user details.
 * @param {string} user.name of the new user (must be uniquefor each user).
 * @param {string} user.pswd of the new user.
 * @param {Role[]} [user.roles] assigned to the new user.
 * @param {Privilege[]} [user.privileges] Array of privileges assigned to the new user.
 */
function createUser({ name, pswd, roles, privileges }){
    // Check uniqueness of the name
    if(findUsers({ names : [ name ] }).length > 0){
        throw new Error(`Error: Name ${name} is not valid because it's not unique`);
    }

    // Check that the roles exist
    if(!exists(roles, _roles)){
        throw new Error(`Error: roles ${roles} are not valid because they don't exist`);
    }

    // Check if the privileges exist
    if(!exists(privileges, _privileges)){
        throw new Error(`Error: privileges ${privileges} are not valid because they don't exist`);
    }

    _users.push({
        name : name,
        pswd : pswd,
        privileges : privileges,
        role : roles,
    });
}

/**
 * Function to drop (delete) an array of existing users.
 * 
 * @param {User[]} users to be dropped.
 */
function dropUsers(users){
    drop(users, _users);
}

/**
 * Function to grant privileges to a user.
 * 
 * @param {User} user whom to grant privileges.
 * @param {Privilege[]} privileges to be granted to the user.
 */
function grantUser(user, privileges){
    grant(user, privileges);
}

/**
 * Function to revoke privileges from a user.
 * 
 * @param {User} user whom to revoke privileges.
 * @param {Privilege[]} privileges to be revoked from the user.
 */
function revokeUser(user, privileges){
    revoke(user, privileges);
}

/**
 * Function to assign a list of roles to a user
 * 
 * @param {User} user who is going to get the roles
 * @param {Role[]} roles to be givven to the user
 */
function assignRoles(user, roles){
    // Check that the roles exist
    if(!exists(roles, _roles)){
        throw new Error(`Error: Roles ${roles} are not valid because they don't exist`);
    }

    // Grant the roles to the user
    roles.forEach((role) => {
        if(!exists([role], user.roles)){
            user.roles.push(role);
        }
    });
}

/**
 * Function to revoke a list of roles from a user
 * 
 * @param {User} user whom to revoke the roles from
 * @param {Role[]} roles to be revoked from the user
 */
function revokeRoles(user, roles){
    user.roles = user.roles.filter((role) => { !roles.includes(role) });
}
// #endregion

// #region roles
/**
 * Function to create a new Role.
 *
 * @param {Object} role to be created.
 * @param {string} role.name 
 * @param {Privilege[]} [role.privileges] 
 */
function createRole({ name, privileges }){
    const newRole = {
        name : name,
        privileges : privileges
    };

    // Check if the privileges exist
    if(!exists(privileges, _privileges)){
        throw new Error(`Error: privileges ${privileges} are not valid because they don't exist`);
    }

    // Check that the role doesn't exist
    if(exists([newRole], _roles)){
        throw new Error(`Error: role ${name} already exists`);
    }

    // Add the role to the list
    _roles.push(newRole);
}

/**
 * Function to drop (delete) an existing role.
 * 
 * @param {Role[]} roles to be dropped. 
 */
function dropRoles(roles){
    drop(roles, _roles);
}

/**
 * Function to grant privileges to a role.
 * 
 * @param {Role} role to be granted of privileges.
 * @param {Privilege[]} privileges to be granted to the role.
 */
function grantRole(role, privileges){
    grant(role, privileges);
}

/**
 * Function to revoke privileges from a role.
 * 
 * @param {Role} role to be revoked from privileges.
 * @param {Privilege[]} privileges to be revoked from the role.
 */
function revokeRole(role, privileges){
    revoke(role, privileges);
}
// #endregion

// #region privileges
/**
 * Function to create a new privilege.
 * 
 * @param {Object} privilege to be created
 * @param {string} privilege.name of the privilege to be created (must be unique). 
 */
function createPrivilege({ name }){
    const newPrivilege = {
        name : name
    };

    // Check if the privilege already exist
    if(exists([newPrivilege], _privileges)){
        throw new Error(`Error: privilege ${newPrivilege} is not valid because it already exists`);
    }

    // Add the new privilege
    _privileges.push(newPrivilege);
}

/**
 * Function to drop a list of existing privileges
 * 
 * @param {Privilege[]} privileges to be dropped
 */
function dropPrivileges(privileges){
    drop(privileges, _privileges);
}
// #endregion

/**
 * Function to assert if a user has a list of privileges
 * 
 * @param {User} user to test
 * @param {Privilege[]} privileges that the user needs to own
 */
function assert(user, privileges){
    return exists(privileges, user.privileges);
}

module.exports = {
    assert : assert,
    storage : {
        users : _users,
        roles : _roles,
        privileges : _privileges
    },
    privileges : {
        create : createPrivilege,
        drop : dropPrivileges
    },
    roles : {
        create : createRole,
        drop : dropRoles,
        grant : grantRole,
        revoke : revokeRole
    },
    users : {
        create : createUser,
        drop : dropUsers,
        grant : grantUser,
        revoke : revokeUser,
        assignRoles : assignRoles,
        revokeRoles : revokeRoles
    }
}