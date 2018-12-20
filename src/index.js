const defaultOptions = {
    isDirtyFlagName: '$isDirty',
    isNewFlagName: '$isNew'
};

export default {
    install(components, installOptions) {
        const pluginOptions = { ...defaultOptions, ...installOptions };

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
         * Overwriting the $fill method used when calling
         * new Model() to inject automatically the 2 flags
         * with default value to false and set value to the
         * provided record if it exists
         */

        // Save
        const _saveFillMethod = Model.prototype.$fill;

        // Overwrite
        Model.prototype.$fill = function(record) {
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
        Query.on('beforeUpdate', function(model) {
            model[pluginOptions.isDirtyFlagName] = true;
        });

        /**
         * Providing the allDirty getter
         */
        RootGetters.allDirty = function(state) {
            return function(entity) {
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
                    return result;
                }
            };
        };

        Getters.allDirty = function(state, _getters, _rootState, rootGetters) {
            return function() {
                return rootGetters[`${state.$connection}/allDirty`](
                    state.$name
                );
            };
        };

        /**
         * Providing the createNew factory
         * When called on the Model instead of new, it will
         * set the 2 flags to true
         */
        Model.createNew = function(insertInStore = true) {
            if (insertInStore) return this.dispatch('createNew');
            else {
                let record = new this();
                record[pluginOptions.isNewFlagName] = true;
                record[pluginOptions.isDirtyFlagName] = true;
                return record;
            }
        };

        RootMutations.createNew = function(state, payload) {
            const entity = payload.entity;
            const result = payload.result;

            const query = new Query(state, entity);

            query.setResult(result).createNew();
        };

        Actions.createNew = function(context) {
            const state = context.state;
            const entity = state.$name;

            return context.dispatch(
                `${state.$connection}/createNew`,
                { entity },
                { root: true }
            );
        };

        RootActions.createNew = function(context, payload) {
            const result = { data: {} };

            context.commit('createNew', { ...payload, result });

            return result.data;
        };

        Query.prototype.createNew = function() {
            let record = new this.model().$toJson();

            record[pluginOptions.isNewFlagName] = true;
            record[pluginOptions.isDirtyFlagName] = true;

            const result = this.insert(record, {});

            this.result.data = result[this.entity][0];

            return this.result.data;
        };
    }
};
