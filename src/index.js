const defaultOptions = {
    isDirtyFlagName: '$isDirty',
    isNewFlagName: '$isNew',
    exposeFlagsExternally: true
};

export default {
    install(components, installOptions) {
        const pluginOptions = {
            ...defaultOptions,
            ...installOptions
        };

        const {
            Model,
            Query,
            RootGetters,
            Getters,
            RootMutations,
            RootActions,
            Actions
        } = components;

        /**
         * Flags are exposed by default when stringiying into JSON.
         * This can be deactivated by setting the flag to false
         */
        if (pluginOptions.exposeFlagsExternally) {
            const localFieldModel = {
                [pluginOptions.isDirtyFlagName]: Model.attr(false),
                [pluginOptions.isNewFlagName]: Model.attr(false)
            };

            const _saveGetFiedsMethod = Model.prototype.$fields;
            Model.prototype.$fields = function () {
                const existing = _saveGetFiedsMethod.call(this);
                return Object.assign({}, existing, localFieldModel);
            }
        }

        /**
         * Overwriting the $fill method used when calling
         * new Model() to inject automatically the 2 flags
         * with default value to false and set value to the
         * provided record if it exists
         */

        // Save
        const _saveFillMethod = Model.prototype.$fill;

        // Overwrite
        Model.prototype.$fill = function (record) {
            _saveFillMethod.call(this, record); // Calling initial

            // $isDirty
            this[pluginOptions.isDirtyFlagName] =
                (record && record[pluginOptions.isDirtyFlagName]) || false;

            // $isNew
            this[pluginOptions.isNewFlagName] =
                (record && record[pluginOptions.isNewFlagName]) || false;
        };

        /**
         * Setting $isDirty = true when updating an entity.
         * This is the only automatic way which sets this flag
         * to true once it's in the store.
         */
        let _ignoreIsDirtyFlag = false;

        Query.on('beforeUpdate', function (model) {
            if (!_ignoreIsDirtyFlag)
                model[pluginOptions.isDirtyFlagName] = true;
        });

        /**
         * Providing the resetFlags actions
         */
        RootActions.resetAllDirtyFlags = function ({
            rootGetters
        }) {
            const allDirty = rootGetters['entities/allDirty']();
            _ignoreIsDirtyFlag = true;
            allDirty.forEach(e =>
                e.$update({
                    [pluginOptions.isDirtyFlagName]: false
                })
            );
            _ignoreIsDirtyFlag = false;
        };

        // Overwriting to add preventDirtyFlag option
        const _insertOrUpdate = RootMutations.insertOrUpdate;
        RootMutations.insertOrUpdate = function (state, payload) {
            if (payload.preventDirtyFlag === true) {
                _ignoreIsDirtyFlag = true;
                _insertOrUpdate.call(this, state, payload);
                _ignoreIsDirtyFlag = false;
            } else
                _insertOrUpdate.call(this, state, payload);
        };

        // Overwriting to add preventDirtyFlag option
        const _update = RootMutations.update;
        RootMutations.update = function (state, payload) {
            if (payload.preventDirtyFlag === true) {
                _ignoreIsDirtyFlag = true;
                _update.call(this, state, payload);
                _ignoreIsDirtyFlag = false;
            } else
                _update.call(this, state, payload);
        };

        /**
         * Providing the allDirty getter
         */
        RootGetters.allDirty = function (state) {
            return function (entity) {
                if (entity) {
                    return new Query(state, entity)
                        .where(elt => elt[pluginOptions.isDirtyFlagName])
                        .get();
                } else {
                    let result = [];
                    const allEntities = Model.database().entities;
                    allEntities.forEach(e => {
                        let elts = new Query(state, e.name)
                            .where(elt => elt[pluginOptions.isDirtyFlagName])
                            .get();
                        result = result.concat(elts);
                    });
                    return [...new Set(result)];
                }
            };
        };

        Getters.allDirty = function (state, _getters, _rootState, rootGetters) {
            return function () {
                return rootGetters[`${state.$connection}/allDirty`](
                    state.$name
                );
            };
        };

        /**
         * Providing the allNew getter
         */
        RootGetters.allNew = function (state) {
            return function (entity) {
                if (entity) {
                    return new Query(state, entity)
                        .where(elt => elt[pluginOptions.isNewFlagName])
                        .get();
                } else {
                    let result = [];
                    const allEntities = Model.database().entities;
                    allEntities.forEach(e => {
                        let elts = new Query(state, e.name)
                            .where(elt => elt[pluginOptions.isNewFlagName])
                            .get();
                        result = result.concat(elts);
                    });
                    return [...new Set(result)];
                }
            };
        };

        Getters.allNew = function (state, _getters, _rootState, rootGetters) {
            return function () {
                return rootGetters[`${state.$connection}/allNew`](state.$name);
            };
        };

        /**
         * Providing the createNew factory
         * When called on the Model instead of new, it will
         * set the 2 flags to true
         */
        Model.createNew = function (insertInStore = true) {
            if (insertInStore) return this.dispatch('createNew');
            else {
                let record = new this();
                record[pluginOptions.isNewFlagName] = true;
                record[pluginOptions.isDirtyFlagName] = true;
                return Promise.resolve(record);
            }
        };

        RootMutations.createNew = function (state, payload) {
            const entity = payload.entity;
            const result = payload.result;

            result.data = (new Query(state, entity)).createNew();
        };

        Actions.createNew = function (context) {
            const state = context.state;
            const entity = state.$name;

            return context.dispatch(
                `${state.$connection}/createNew`, {
                    entity
                }, {
                    root: true
                }
            );
        };

        RootActions.createNew = function (context, payload) {
            const result = {
                data: {}
            };

            context.commit('createNew', {
                ...payload,
                result
            });

            return result.data;
        };

        Query.prototype.createNew = function () {
            let record = new this.model().$toJson();

            record[pluginOptions.isNewFlagName] = true;
            record[pluginOptions.isDirtyFlagName] = true;

            const result = this.insert(record, {});
            return result[this.entity][0];
        };
    }
};