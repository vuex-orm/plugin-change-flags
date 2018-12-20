/** TEST SETUP for VuexORM **/
import Vue from 'vue';
import Vuex from 'vuex';
import VuexORM from '@vuex-orm/core';
import IsDirtyIsNewPlugin from '../../src';

Vue.use(Vuex);
VuexORM.use(IsDirtyIsNewPlugin);

/**
 * Create a new Vuex Store.
 */
export function createStore(entities, namespace) {
    const database = new VuexORM.Database();

    entities.forEach(entity => {
        database.register(entity.model, entity.module || {});
    });

    return new Vuex.Store({
        plugins: [VuexORM.install(database, { namespace })],
        strict: true
    });
}
