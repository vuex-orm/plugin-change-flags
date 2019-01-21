<p align="center">
  <img width="192" src="https://github.com/vuex-orm/vuex-orm/blob/master/logo-vuex-orm.png" alt="Vuex ORM">
</p>

<h1 align="center">Vuex ORM IsDirty / IsNew plugin</h1>

<h3 align="center">This project is supported by <a href="https://www.generativeobjects.com/" target="_blank">Generative Objects</a></h3>

[![Build Status](https://travis-ci.org/vuex-orm/plugin-change-flags.svg?branch=master)](https://travis-ci.org/vuex-orm/plugin-change-flags) [![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

This is a plugin for the [Vuex-ORM](https://github.com/vuex-orm/vuex-orm) library.
It adds two flags `$isDirty` and `$isNew` (as _boolean_ attributes) on any instance of the entities created through this library and updates their values automatically.

## Installation

Simply reference the github project in your `package.json`

```javascript
dependencies: {
    ...
    "vuexorm-isdirty-plugin": "git://github.com/vuex-orm/vuexorm-isdirty-plugin"
    ...
}
```

and run `npm install`.

Then, you need to install the plugin as any VuexORM plugin. In your store initialization code, simply add:

```javascript
import VuexORMisDirtyPlugin from 'vuexorm-isdirty-plugin';
```

and then

```javascript
VuexORM.use(VuexORMisDirtyPlugin);
```

## Usage

Once the plugin installed, every time you create a new instance of an entity, the `$isDirty` and `$isNew` will be automatically added.

The default value for those flags is `false`. They are _automatically_ set to `true` in the following cases:

### \$isDirty

This flag is _automatically_ set to `true` when:

-   creating a new instance using the `createNew` method;
-   updating the entity instance in the store, using the `update` action (`insert` and `create` mutation will not set this flag to `true`).

### \$isNew

This flag is _automatically_ set to `true` when calling the `createNew` method.

### Hydrating with other default values

When calling the Model constructor `new Model()`, the default values for both flags is `false`.  
Other values can be set by passing the initial record value to the constructor:

```javascript
let user = new User({ id: 1, $isNew: true });

console.log(user.$isNew); // true (set through parameter)
console.log(user.$isDirty); // false (default value)
```

## Methods

This plugin also adds the `Model.createNew` method and the `allDirty` & `allNew` getters.

### `createNew` factory method

The plugin provides a new `Model.createNew(insertInStore = true)` method which returns a new instance of the entity, with both flags set to `true` by default and all other fields set to their default value.

This method copies VuexORM [new](https://vuex-orm.github.io/vuex-orm/guide/store/inserting-and-updating-data.html#inserts) method behavior. As such, it will automatically insert the newly created entity in the store.

If you don't want the created instance to be inserted in store directly, you can pass `false` as parameter.

:warning: When calling the `createNew` method without parameter, this will try to insert the given record directly in the store. It might fail if default value for the Primary Key is `null`. Try using an [increment type attribute](https://vuex-orm.github.io/vuex-orm/guide/components/models.html#auto-increment-type) or a [mutator](https://vuex-orm.github.io/vuex-orm/guide/advanced/accessors-and-mutators.html#defining-mutators) to make sure your PK as a value.

### `allDirty` getter

This new getter returns all entities marked as dirty currently in the store.

It can be used globally:

```javascript
// Returns an array of mixed types with all entities
// currently marked as dirty in the store
let results = store.getters['entities/allDirty']();
```

or specifically to a type:

```javascript
// Returns an array User entities currently marked as dirty in the store
let results = store.getters['entities/users/allDirty']();
```

### `allNew` getter

This new getter returns all entities marked as new currently in the store.

It can be used globally:

```javascript
// Returns an array of mixed types with all entities
// currently marked as new in the store
let results = store.getters['entities/allNew']();
```

or specifically to a type:

```javascript
// Returns an array User entities currently marked as new in the store
let results = store.getters['entities/users/allNew']();
```

## Plugin Options

By default, the flags are named `$isDirty` and `$isNew`.  
You can override those default by setting the corresponding options at plugin initialization.

| Option name     | Description                         | Default value |
| --------------- | ----------------------------------- | :-----------: |
| isNewFlagName   | Sets the name of the _isNew_ flag   |   `$isNew`    |
| isDirtyFlagName | Sets the name of the _isDirty_ flag |  `$isDirty`   |

In order to use those options, you can pass them as the second parameter of the `install` call:

```javascript
VuexORM.use(VuexORMisDirtyPlugin, {
    isNewFlagName: 'IsNew',
    isDirtyFlagName: 'IsDirty'
});
```

## License

[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
