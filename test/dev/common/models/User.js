import { Model } from '@vuex-orm/core';
import Role from './Role';

export default class User extends Model {
    static entity = 'users';

    static primaryKey = 'id';

    static fields() {
        return {
            id: this.increment(0),
            name: this.attr(''),
            email: this.attr(''),
            phone: this.attr(''),
            roleId: this.attr(null),
            role: this.belongsTo(Role, 'roleId')
        };
    }
}
