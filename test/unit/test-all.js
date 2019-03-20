import {
    createStore
} from '../dev/';
import User from '../dev/common/models/User';
import Role from '../dev/common/models/Role';
import {
    expect
} from 'chai';

describe('Vuex ORM $isDirty/$isNew plugin default installation', function () {
    it('should have both flag set to false when creating new', function () {
        const store = createStore([{
            model: User
        }]);
        let u = new User();
        expect(u.$isDirty).to.equal(false);
        expect(u.$isNew).to.equal(false);
    });

    it('should have both flags set to true when creating using the createNew method -- No store insertion', async function () {
        const store = createStore([{
            model: User
        }]);
        let u = await User.createNew(false);
        expect(u.$isDirty).to.equal(true);
        expect(u.$isNew).to.equal(true);
    });

    it('should have both flags set to true when creating using the createNew method -- With store insertion', async function () {
        const store = createStore([{
            model: User
        }]);
        let u1 = await User.createNew();

        let u2 = store.getters['entities/users/all']()[0];
        expect(u2.$isDirty).to.equal(true);
        expect(u2.$isNew).to.equal(true);
        expect(u1.id).to.equal(u2.id);
    });

    it('should take record flags when instanciating from existing', function () {
        const store = createStore([{
            model: User
        }]);
        let user = {
            name: 'A',
            email: 'B',
            phone: '111',
            $isNew: false,
            $isDirty: true
        };
        let u = new User(user);
        expect(u.$isDirty).to.equal(true);
        expect(u.$isNew).to.equal(false);
    });

    it('should set $isDirty flag to true when updating data in store', function () {
        const store = createStore([{
            model: User
        }]);

        // Creating using the constructor, not the factory
        // to make sure $isDirty / $isNew are false
        let user = new User({
            id: 1
        });

        // Inserting new data
        User.insert({
            data: user
        });
        expect(user.$isDirty).to.equal(false);

        // Updating
        user.email = 'AA';
        User.update({
            data: user
        });

        // Checking
        let result = store.getters['entities/users/find'](1);

        expect(result.$isDirty).to.equal(true);
    });

    it('should provide a way to fetch all dirty entities in one call', function () {
        const store = createStore([{
            model: User
        }, {
            model: Role
        }]);

        let user = new User({
            id: 1,
            roleId: 1
        });
        let user2 = new User({
            id: 2,
            roleId: 1
        });
        let role = new Role({
            id: 3
        });

        User.insert({
            data: [user, user2]
        });
        Role.insert({
            data: role
        });

        user.name = 'AA';
        role.name = 'AA';

        User.update({
            data: user
        });
        Role.update({
            data: role
        });

        let result = store.getters['entities/allDirty']();
        expect(result.length).to.equal(2);

        // Making sure to have first ID first
        result.sort((a, b) => {
            return a.$id > b.$id ? 1 : a.$id < b.$id ? -1 : 0;
        });
        expect(result[0].id).to.equal(1);
        expect(result[1].id).to.equal(3);
    });

    it('should provide a way to fetch all dirty entities of one type', function () {
        const store = createStore([{
            model: User
        }, {
            model: Role
        }]);

        let user = new User({
            id: 1,
            roleId: 1
        });
        let user2 = new User({
            id: 2,
            roleId: 1
        });
        let role = new Role({
            id: 3
        });

        User.insert({
            data: [user, user2]
        });
        // Using insertOrUpdate for test coverage
        Role.insertOrUpdate({
            data: role
        });

        user.name = 'AA';
        role.name = 'AA';

        User.update({
            data: user
        });
        Role.update({
            data: role
        });

        let result = store.getters['entities/users/allDirty']();
        expect(result.length).to.equal(1);
        expect(result[0].id).to.equal(1);
    });

    it('should provide a way to fetch all new entities in one call', function () {
        const store = createStore([{
            model: User
        }, {
            model: Role
        }]);

        let user = User.createNew();
        let user2 = new User({
            id: 2,
            roleId: 1
        });
        let role = Role.createNew();

        let result = store.getters['entities/allNew']();
        expect(result.length).to.equal(2);

        expect(result[0].id).to.equal(1);
        expect(result[1].id).to.equal(1);
    });

    it('should provide a way to fetch new entities of one type', function () {
        const store = createStore([{
            model: User
        }, {
            model: Role
        }]);

        let user = User.createNew();
        let user2 = new User({
            id: 2,
            roleId: 1
        });
        let role = Role.createNew();

        let result = store.getters['entities/users/allNew']();
        expect(result.length).to.equal(1);

        expect(result[0] instanceof User).to.equal(true);
    });

    it('should provide a way to reset all dirty flags to false', async function () {
        const store = createStore([{
            model: User
        }, {
            model: Role
        }]);

        let user = new User({
            id: 1,
            roleId: 1
        });
        let user2 = new User({
            id: 2,
            roleId: 1
        });
        let role = new Role({
            id: 3
        });

        User.insert({
            data: [user, user2]
        });
        Role.insert({
            data: role
        });

        user.name = 'AA';
        role.name = 'AA';

        User.update({
            data: user
        });
        Role.update({
            data: role
        });


        let result = store.getters['entities/allDirty']();
        expect(result.length).to.equal(2);
        await store.dispatch('entities/resetAllDirtyFlags', {}, {
            root: true
        });

        let result2 = store.getters['entities/allDirty']();
        expect(result2.length).to.equal(0);
    });


    it('should provide a way to ignore dirty flag when updating data', async function () {
        const store = createStore([{
            model: User
        }, {
            model: Role
        }]);

        let user = new User({
            id: 1,
            roleId: 1
        });

        User.insert({
            data: [user]
        });

        user.name = 'AA';

        User.update({
            data: user,
            preventDirtyFlag: true
        });

        let result = store.getters['entities/allDirty']();
        expect(result.length).to.equal(0);
    });

    it('should provide a way to ignore dirty flag when insertingOrUpdating data', async function () {
        const store = createStore([{
            model: User
        }, {
            model: Role
        }]);

        let user = new User({
            id: 1,
            roleId: 1
        });
        let user2 = new User({
            id: 2,
            roleId: 1
        });

        User.insert({
            data: [user, user2]
        });

        user.name = 'AA';

        User.insertOrUpdate({
            data: [user, user2],
            preventDirtyFlag: true
        });

        let result = store.getters['entities/allDirty']();
        expect(result.length).to.equal(0);

        let users = store.getters['entities/users/all']();
        expect(users.length).to.equal(2);

    });

    it('should expose flags by default', async function () {
        const store = createStore([{
            model: User
        }]);

        let user = new User({
            id: 1,
            roleId: 1,
            name: "Test",
            email: "Test"
        });

        User.insert({
            data: [user]
        });

        let u = store.getters['entities/users/find'](1);
        expect(JSON.stringify(u)).to.equal('{"id":1,"name":"Test","email":"Test","phone":"","roleId":1,"role":null,"$isDirty":false,"$isNew":false}');
    });
});