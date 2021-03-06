import path from 'path';

import chai from 'chai';
import mocha from 'mocha';
import proxyquire from 'proxyquire';
import React from 'react';
import sinon from 'sinon';


proxyquire.noPreserveCache();

export function createComponent(component, props) {
    const Component = component;
    const cls = (
        Component.type ?
        Component :
        React.createElement(Component, props)
    );

    return new cls.type(
        cls.props,
        cls._context //eslint-disable-line
    );
}

export function renderComponent(...args) {
    const component = createComponent(...args);

    if (typeof component.render === 'function') {
        return component.render();
    }

    return component;
}

export function noop() {

}

export function maybeFn(fn) {
    return fn && typeof fn === 'function' ? fn : noop;
}

export function isTestMethod(key, testCase) {
    return key.slice(0, 4) === 'test' && typeof testCase[key] === 'function';
}

export function addAfter(testCase) {
    testCase.Mingus.after(testCase.after.bind(testCase));
}

export function addAfterEach(testCase) {
    testCase.Mingus.afterEach(testCase.afterEach.bind(testCase));
}

export function addBefore(testCase) {
    testCase.Mingus.before(testCase.before.bind(testCase));
}

export function addBeforeEach(testCase) {
    testCase.Mingus.beforeEach(testCase.beforeEach.bind(testCase));
}

export function addIt(testCase) {
    Object.keys(testCase.config).filter(
        (key) => isTestMethod(key, testCase.config)
    ).forEach(
        (key) => testCase.Mingus.it(key, testCase.config[key].bind(testCase))
    );
}

export function addDescribe(testCase) {
    mocha.describe(testCase.name, () => {
        addAfter(testCase);
        addAfterEach(testCase);
        addBefore(testCase);
        addBeforeEach(testCase);
        addIt(testCase);
    });
}

export function restoreAll(obj) {
    if (obj.restore && typeof obj.restore === 'function') {
        obj.restore();
    }
}

export function clearPatches(testCase) {
    testCase.patches.forEach(restoreAll);
    testCase.patches = [];
}

export function clearStubs(testCase) {
    testCase.stubs.forEach(restoreAll);
    testCase.stubs = [];
}

export function clearSpies(testCase) {
    testCase.spies.forEach(restoreAll);
    testCase.spies = [];
}

export function getHooks(testCase) {
    return {
        after: maybeFn(testCase.config.after).bind(testCase),
        afterEach: maybeFn(testCase.config.afterEach).bind(testCase),
        before: maybeFn(testCase.config.before).bind(testCase),
        beforeEach: maybeFn(testCase.config.beforeEach).bind(testCase)
    };
}

export function getModulePath(mod) {
    return (
        mod[0] === '.' ?
        path.resolve(module.parent.id, '..', mod) :
        mod
    );
}

export function fakeRequire(mod, ...args) {
    return proxyquire(getModulePath(mod), ...args);
}

export function initTests(testCase) {
    addDescribe(testCase);
}

export function patch(testCase, obj, key, patched) {
    const original = obj[key];

    obj[key] = patched;

    testCase.patches.push({
        restore() {
            obj[key] = original;
        }
    });

    return testCase.patches[testCase.patches.length - 1];
}

export function spy(testCase, ...args) {
    testCase.spies.push(sinon.spy(...args));

    return testCase.spies[testCase.spies.length - 1];
}

export function stub(testCase, ...args) {
    testCase.stubs.push(sinon.stub(...args));

    return testCase.stubs[testCase.stubs.length - 1];
}

export function throwAssertionError(shouldThrow, msg) {
    if (shouldThrow) {
        throw new chai.AssertionError(msg);
    }
}
