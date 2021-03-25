
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.35.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    // from http://stackoverflow.com/a/18473154
    const partialCircle = (cx, cy, r, start, end) => {
    	const length = end - start;
    	if (length === 0) return []

    	const fromX = r * Math.cos(start) + cx;
    	const fromY = r * Math.sin(start) + cy;
    	const toX = r * Math.cos(end) + cx;
    	const toY = r * Math.sin(end) + cy;
    	const large = Math.abs(length) <= Math.PI ? '0' : '1';
    	const sweep = length < 0 ? '0' : '1';

    	return [
    		['M', fromX, fromY],
    		['A', r, r, 0, large, sweep, toX, toY]
    	]
    };

    var svgPartialCircle = partialCircle;

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const fs = require("fs");
    const path = require("path");


    // const createTimerState = () => {
    //     const { subscribe, set, update } = writable({
    //         running: false,
    //         startTime: Date.now(),
    //         duration: 10000
    //     });
    //
    //     return {
    //         subscribe,
    //         play:
    //     }
    // }


    const time = readable(Date.now(), (set) => {
        const interval = setInterval(() => {
            set(Date.now());
        }, 10);

        return () => clearInterval(interval);
    });

    const pausedRemainingTime = writable(10000);

    const runState = writable("running");

    const startTime = writable(Date.now());

    const duration = writable(100000);


    const remainingTime = derived(
        [time, duration, startTime, runState, pausedRemainingTime],
        ([$time, $duration, $start, $runState, $pausedRemainingTime]) => {
            if ($runState === "running") {
                const remTime = $duration - ($time - $start);
                if (remTime <= 0) runState.set("done");
                return remTime;
            }
            else if ($runState === "paused") return $pausedRemainingTime;
            else return 0;
        }
    );


    const start = (dur) => {
        startTime.set(Date.now());
        duration.set(dur);
        runState.set("running");
    };


    const pause = () => {
        const remTime = get_store_value(remainingTime);
        pausedRemainingTime.set(remTime);
        runState.set("paused");
    };

    const resume = () => {
        const dur = get_store_value(duration);
        const remTime = get_store_value(pausedRemainingTime);
        startTime.set(Date.now() - (dur - remTime));
        runState.set("running");
    };



    // pause()
    //
    // resume()


    // export const playing = derived(
    //     [remainingTime],
    //     ($remainingTime) => $remainingTime > 0
    // )

    const circleAngle = derived(
        [remainingTime, duration],
        ([$remainingTime, $duration]) => (
            $remainingTime > 0 ? ($remainingTime * 360 / $duration) % 360 : 0
        )
    );


    // read settings file:
    const settingsData = JSON.parse(fs.readFileSync(path.join(__dirname, "./settings.json")));
    console.log("settingsData: ", settingsData);
    const settings = writable(settingsData);

    /* src\Components\TimeIndicatorInput.svelte generated by Svelte v3.35.0 */
    const file$3 = "src\\Components\\TimeIndicatorInput.svelte";

    function create_fragment$3(ctx) {
    	let h1;
    	let t_value = /*formatTime*/ ctx[1](/*$remainingTime*/ ctx[0]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t = text(t_value);
    			attr_dev(h1, "class", "time svelte-1431n8k");
    			add_location(h1, file$3, 20, 0, 616);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$remainingTime*/ 1 && t_value !== (t_value = /*formatTime*/ ctx[1](/*$remainingTime*/ ctx[0]) + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $remainingTime;
    	validate_store(remainingTime, "remainingTime");
    	component_subscribe($$self, remainingTime, $$value => $$invalidate(0, $remainingTime = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TimeIndicatorInput", slots, []);

    	const formatTime = msTime => {
    		if (msTime <= 0) {
    			return "00:00";
    		}

    		const date = new Date(msTime);
    		const hours = date.getHours();
    		const minutes = date.getMinutes();
    		const seconds = date.getSeconds();
    		const hoursStr = hours > 0 ? hours.toString() + ":" : "";
    		const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    		const secondsStr = seconds < 10 ? `0${seconds}` : seconds;
    		return `${hoursStr}${minutesStr}:${secondsStr}`;
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TimeIndicatorInput> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		remainingTime,
    		formatTime,
    		$remainingTime
    	});

    	return [$remainingTime, formatTime];
    }

    class TimeIndicatorInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TimeIndicatorInput",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\Components\Timer.svelte generated by Svelte v3.35.0 */
    const file$2 = "src\\Components\\Timer.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let svg;
    	let circle;
    	let circle_r_value;
    	let circle_stroke_value;
    	let path_1;
    	let path_1_d_value;
    	let path_1_stroke_value;
    	let t;
    	let timeindicatorinput;
    	let current;
    	timeindicatorinput = new TimeIndicatorInput({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			path_1 = svg_element("path");
    			t = space();
    			create_component(timeindicatorinput.$$.fragment);
    			attr_dev(circle, "r", circle_r_value = /*size*/ ctx[0] / 2 - /*thickness*/ ctx[2]);
    			attr_dev(circle, "cx", "50%");
    			attr_dev(circle, "cy", "50%");
    			attr_dev(circle, "fill", "transparent");
    			attr_dev(circle, "stroke-width", /*thickness*/ ctx[2]);
    			attr_dev(circle, "stroke", circle_stroke_value = /*color*/ ctx[1].alpha(0.06).hsl().string());
    			add_location(circle, file$2, 37, 8, 898);
    			attr_dev(path_1, "d", path_1_d_value = `${/*path*/ ctx[3]}`);
    			attr_dev(path_1, "stroke-width", /*thickness*/ ctx[2]);
    			attr_dev(path_1, "stroke", path_1_stroke_value = /*color*/ ctx[1].hsl().string());
    			attr_dev(path_1, "stroke-linecap", "round");
    			attr_dev(path_1, "fill", "transparent");
    			add_location(path_1, file$2, 39, 8, 1073);
    			attr_dev(svg, "width", /*size*/ ctx[0]);
    			attr_dev(svg, "height", /*size*/ ctx[0]);
    			add_location(svg, file$2, 36, 4, 856);
    			attr_dev(div, "class", "Timer svelte-185t0k5");
    			set_style(div, "--size", /*size*/ ctx[0]);
    			set_style(div, "--color", /*color*/ ctx[1].hsl().string());
    			set_style(div, "--fontSize", /*size*/ ctx[0] / 6 + "px");
    			set_style(div, "--fontFamily", "Roboto " + /*$settings*/ ctx[4].fontWeight + "\r\n");
    			add_location(div, file$2, 27, 0, 648);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, circle);
    			append_dev(svg, path_1);
    			append_dev(div, t);
    			mount_component(timeindicatorinput, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*size, thickness*/ 5 && circle_r_value !== (circle_r_value = /*size*/ ctx[0] / 2 - /*thickness*/ ctx[2])) {
    				attr_dev(circle, "r", circle_r_value);
    			}

    			if (!current || dirty & /*thickness*/ 4) {
    				attr_dev(circle, "stroke-width", /*thickness*/ ctx[2]);
    			}

    			if (!current || dirty & /*color*/ 2 && circle_stroke_value !== (circle_stroke_value = /*color*/ ctx[1].alpha(0.06).hsl().string())) {
    				attr_dev(circle, "stroke", circle_stroke_value);
    			}

    			if (!current || dirty & /*path*/ 8 && path_1_d_value !== (path_1_d_value = `${/*path*/ ctx[3]}`)) {
    				attr_dev(path_1, "d", path_1_d_value);
    			}

    			if (!current || dirty & /*thickness*/ 4) {
    				attr_dev(path_1, "stroke-width", /*thickness*/ ctx[2]);
    			}

    			if (!current || dirty & /*color*/ 2 && path_1_stroke_value !== (path_1_stroke_value = /*color*/ ctx[1].hsl().string())) {
    				attr_dev(path_1, "stroke", path_1_stroke_value);
    			}

    			if (!current || dirty & /*size*/ 1) {
    				attr_dev(svg, "width", /*size*/ ctx[0]);
    			}

    			if (!current || dirty & /*size*/ 1) {
    				attr_dev(svg, "height", /*size*/ ctx[0]);
    			}

    			if (!current || dirty & /*size*/ 1) {
    				set_style(div, "--size", /*size*/ ctx[0]);
    			}

    			if (!current || dirty & /*color*/ 2) {
    				set_style(div, "--color", /*color*/ ctx[1].hsl().string());
    			}

    			if (!current || dirty & /*size*/ 1) {
    				set_style(div, "--fontSize", /*size*/ ctx[0] / 6 + "px");
    			}

    			if (!current || dirty & /*$settings*/ 16) {
    				set_style(div, "--fontFamily", "Roboto " + /*$settings*/ ctx[4].fontWeight + "\r\n");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timeindicatorinput.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timeindicatorinput.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(timeindicatorinput);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let thickness;
    	let path;
    	let $circleAngle;
    	let $settings;
    	validate_store(circleAngle, "circleAngle");
    	component_subscribe($$self, circleAngle, $$value => $$invalidate(5, $circleAngle = $$value));
    	validate_store(settings, "settings");
    	component_subscribe($$self, settings, $$value => $$invalidate(4, $settings = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Timer", slots, []);
    	let { size } = $$props;
    	let { color } = $$props;
    	const π = Math.PI;
    	const degToRad = deg => deg * π / 180;
    	const convertAngle = deg => degToRad(deg - 90);
    	const writable_props = ["size", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Timer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("size" in $$props) $$invalidate(0, size = $$props.size);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		partialCircle: svgPartialCircle,
    		TimeIndicatorInput,
    		remainingTime,
    		circleAngle,
    		settings,
    		size,
    		color,
    		π,
    		degToRad,
    		convertAngle,
    		thickness,
    		path,
    		$circleAngle,
    		$settings
    	});

    	$$self.$inject_state = $$props => {
    		if ("size" in $$props) $$invalidate(0, size = $$props.size);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("thickness" in $$props) $$invalidate(2, thickness = $$props.thickness);
    		if ("path" in $$props) $$invalidate(3, path = $$props.path);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*size*/ 1) {
    			$$invalidate(2, thickness = size / 20);
    		}

    		if ($$self.$$.dirty & /*size, thickness, $circleAngle*/ 37) {
    			$$invalidate(3, path = svgPartialCircle(size / 2, size / 2, size / 2 - thickness, convertAngle($circleAngle), convertAngle(0)).map(cmd => cmd.join(" ")).join(" "));
    		}
    	};

    	return [size, color, thickness, path, $settings, $circleAngle];
    }

    class Timer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { size: 0, color: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Timer",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*size*/ ctx[0] === undefined && !("size" in props)) {
    			console.warn("<Timer> was created without expected prop 'size'");
    		}

    		if (/*color*/ ctx[1] === undefined && !("color" in props)) {
    			console.warn("<Timer> was created without expected prop 'color'");
    		}
    	}

    	get size() {
    		throw new Error("<Timer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Timer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Timer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Timer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Controls.svelte generated by Svelte v3.35.0 */
    const file$1 = "src\\Components\\Controls.svelte";

    function create_fragment$1(ctx) {
    	let button;

    	let t_value = (/*$runState*/ ctx[0] === "paused"
    	? "RESUME"
    	: /*$runState*/ ctx[0] === "running" ? "PAUSE" : "START") + "";

    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			add_location(button, file$1, 13, 0, 329);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*$runState*/ ctx[0] === "paused"
    						? resume
    						: /*$runState*/ ctx[0] === "running"
    							? pause
    							: /*startTimer*/ ctx[1])) (/*$runState*/ ctx[0] === "paused"
    						? resume
    						: /*$runState*/ ctx[0] === "running"
    							? pause
    							: /*startTimer*/ ctx[1]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*$runState*/ 1 && t_value !== (t_value = (/*$runState*/ ctx[0] === "paused"
    			? "RESUME"
    			: /*$runState*/ ctx[0] === "running" ? "PAUSE" : "START") + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $runState;
    	validate_store(runState, "runState");
    	component_subscribe($$self, runState, $$value => $$invalidate(0, $runState = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Controls", slots, []);

    	const startTimer = () => {
    		// startTime.set(Date.now());
    		// duration.set(10000);
    		start(10000);

    		const sound = new Audio("file://" + __dirname + "/sounds/startSound.wav");
    		sound.play();
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Controls> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		start,
    		pause,
    		resume,
    		runState,
    		startTimer,
    		$runState
    	});

    	return [$runState, startTimer];
    }

    class Controls extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Controls",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var colorName$1 = {
    	"aliceblue": [240, 248, 255],
    	"antiquewhite": [250, 235, 215],
    	"aqua": [0, 255, 255],
    	"aquamarine": [127, 255, 212],
    	"azure": [240, 255, 255],
    	"beige": [245, 245, 220],
    	"bisque": [255, 228, 196],
    	"black": [0, 0, 0],
    	"blanchedalmond": [255, 235, 205],
    	"blue": [0, 0, 255],
    	"blueviolet": [138, 43, 226],
    	"brown": [165, 42, 42],
    	"burlywood": [222, 184, 135],
    	"cadetblue": [95, 158, 160],
    	"chartreuse": [127, 255, 0],
    	"chocolate": [210, 105, 30],
    	"coral": [255, 127, 80],
    	"cornflowerblue": [100, 149, 237],
    	"cornsilk": [255, 248, 220],
    	"crimson": [220, 20, 60],
    	"cyan": [0, 255, 255],
    	"darkblue": [0, 0, 139],
    	"darkcyan": [0, 139, 139],
    	"darkgoldenrod": [184, 134, 11],
    	"darkgray": [169, 169, 169],
    	"darkgreen": [0, 100, 0],
    	"darkgrey": [169, 169, 169],
    	"darkkhaki": [189, 183, 107],
    	"darkmagenta": [139, 0, 139],
    	"darkolivegreen": [85, 107, 47],
    	"darkorange": [255, 140, 0],
    	"darkorchid": [153, 50, 204],
    	"darkred": [139, 0, 0],
    	"darksalmon": [233, 150, 122],
    	"darkseagreen": [143, 188, 143],
    	"darkslateblue": [72, 61, 139],
    	"darkslategray": [47, 79, 79],
    	"darkslategrey": [47, 79, 79],
    	"darkturquoise": [0, 206, 209],
    	"darkviolet": [148, 0, 211],
    	"deeppink": [255, 20, 147],
    	"deepskyblue": [0, 191, 255],
    	"dimgray": [105, 105, 105],
    	"dimgrey": [105, 105, 105],
    	"dodgerblue": [30, 144, 255],
    	"firebrick": [178, 34, 34],
    	"floralwhite": [255, 250, 240],
    	"forestgreen": [34, 139, 34],
    	"fuchsia": [255, 0, 255],
    	"gainsboro": [220, 220, 220],
    	"ghostwhite": [248, 248, 255],
    	"gold": [255, 215, 0],
    	"goldenrod": [218, 165, 32],
    	"gray": [128, 128, 128],
    	"green": [0, 128, 0],
    	"greenyellow": [173, 255, 47],
    	"grey": [128, 128, 128],
    	"honeydew": [240, 255, 240],
    	"hotpink": [255, 105, 180],
    	"indianred": [205, 92, 92],
    	"indigo": [75, 0, 130],
    	"ivory": [255, 255, 240],
    	"khaki": [240, 230, 140],
    	"lavender": [230, 230, 250],
    	"lavenderblush": [255, 240, 245],
    	"lawngreen": [124, 252, 0],
    	"lemonchiffon": [255, 250, 205],
    	"lightblue": [173, 216, 230],
    	"lightcoral": [240, 128, 128],
    	"lightcyan": [224, 255, 255],
    	"lightgoldenrodyellow": [250, 250, 210],
    	"lightgray": [211, 211, 211],
    	"lightgreen": [144, 238, 144],
    	"lightgrey": [211, 211, 211],
    	"lightpink": [255, 182, 193],
    	"lightsalmon": [255, 160, 122],
    	"lightseagreen": [32, 178, 170],
    	"lightskyblue": [135, 206, 250],
    	"lightslategray": [119, 136, 153],
    	"lightslategrey": [119, 136, 153],
    	"lightsteelblue": [176, 196, 222],
    	"lightyellow": [255, 255, 224],
    	"lime": [0, 255, 0],
    	"limegreen": [50, 205, 50],
    	"linen": [250, 240, 230],
    	"magenta": [255, 0, 255],
    	"maroon": [128, 0, 0],
    	"mediumaquamarine": [102, 205, 170],
    	"mediumblue": [0, 0, 205],
    	"mediumorchid": [186, 85, 211],
    	"mediumpurple": [147, 112, 219],
    	"mediumseagreen": [60, 179, 113],
    	"mediumslateblue": [123, 104, 238],
    	"mediumspringgreen": [0, 250, 154],
    	"mediumturquoise": [72, 209, 204],
    	"mediumvioletred": [199, 21, 133],
    	"midnightblue": [25, 25, 112],
    	"mintcream": [245, 255, 250],
    	"mistyrose": [255, 228, 225],
    	"moccasin": [255, 228, 181],
    	"navajowhite": [255, 222, 173],
    	"navy": [0, 0, 128],
    	"oldlace": [253, 245, 230],
    	"olive": [128, 128, 0],
    	"olivedrab": [107, 142, 35],
    	"orange": [255, 165, 0],
    	"orangered": [255, 69, 0],
    	"orchid": [218, 112, 214],
    	"palegoldenrod": [238, 232, 170],
    	"palegreen": [152, 251, 152],
    	"paleturquoise": [175, 238, 238],
    	"palevioletred": [219, 112, 147],
    	"papayawhip": [255, 239, 213],
    	"peachpuff": [255, 218, 185],
    	"peru": [205, 133, 63],
    	"pink": [255, 192, 203],
    	"plum": [221, 160, 221],
    	"powderblue": [176, 224, 230],
    	"purple": [128, 0, 128],
    	"rebeccapurple": [102, 51, 153],
    	"red": [255, 0, 0],
    	"rosybrown": [188, 143, 143],
    	"royalblue": [65, 105, 225],
    	"saddlebrown": [139, 69, 19],
    	"salmon": [250, 128, 114],
    	"sandybrown": [244, 164, 96],
    	"seagreen": [46, 139, 87],
    	"seashell": [255, 245, 238],
    	"sienna": [160, 82, 45],
    	"silver": [192, 192, 192],
    	"skyblue": [135, 206, 235],
    	"slateblue": [106, 90, 205],
    	"slategray": [112, 128, 144],
    	"slategrey": [112, 128, 144],
    	"snow": [255, 250, 250],
    	"springgreen": [0, 255, 127],
    	"steelblue": [70, 130, 180],
    	"tan": [210, 180, 140],
    	"teal": [0, 128, 128],
    	"thistle": [216, 191, 216],
    	"tomato": [255, 99, 71],
    	"turquoise": [64, 224, 208],
    	"violet": [238, 130, 238],
    	"wheat": [245, 222, 179],
    	"white": [255, 255, 255],
    	"whitesmoke": [245, 245, 245],
    	"yellow": [255, 255, 0],
    	"yellowgreen": [154, 205, 50]
    };

    var isArrayish = function isArrayish(obj) {
    	if (!obj || typeof obj === 'string') {
    		return false;
    	}

    	return obj instanceof Array || Array.isArray(obj) ||
    		(obj.length >= 0 && (obj.splice instanceof Function ||
    			(Object.getOwnPropertyDescriptor(obj, (obj.length - 1)) && obj.constructor.name !== 'String')));
    };

    var simpleSwizzle = createCommonjsModule(function (module) {



    var concat = Array.prototype.concat;
    var slice = Array.prototype.slice;

    var swizzle = module.exports = function swizzle(args) {
    	var results = [];

    	for (var i = 0, len = args.length; i < len; i++) {
    		var arg = args[i];

    		if (isArrayish(arg)) {
    			// http://jsperf.com/javascript-array-concat-vs-push/98
    			results = concat.call(results, slice.call(arg));
    		} else {
    			results.push(arg);
    		}
    	}

    	return results;
    };

    swizzle.wrap = function (fn) {
    	return function () {
    		return fn(swizzle(arguments));
    	};
    };
    });

    /* MIT license */

    var colorString = createCommonjsModule(function (module) {
    var reverseNames = {};

    // create a list of reverse color names
    for (var name in colorName$1) {
    	if (colorName$1.hasOwnProperty(name)) {
    		reverseNames[colorName$1[name]] = name;
    	}
    }

    var cs = module.exports = {
    	to: {},
    	get: {}
    };

    cs.get = function (string) {
    	var prefix = string.substring(0, 3).toLowerCase();
    	var val;
    	var model;
    	switch (prefix) {
    		case 'hsl':
    			val = cs.get.hsl(string);
    			model = 'hsl';
    			break;
    		case 'hwb':
    			val = cs.get.hwb(string);
    			model = 'hwb';
    			break;
    		default:
    			val = cs.get.rgb(string);
    			model = 'rgb';
    			break;
    	}

    	if (!val) {
    		return null;
    	}

    	return {model: model, value: val};
    };

    cs.get.rgb = function (string) {
    	if (!string) {
    		return null;
    	}

    	var abbr = /^#([a-f0-9]{3,4})$/i;
    	var hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
    	var rgba = /^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
    	var per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
    	var keyword = /(\D+)/;

    	var rgb = [0, 0, 0, 1];
    	var match;
    	var i;
    	var hexAlpha;

    	if (match = string.match(hex)) {
    		hexAlpha = match[2];
    		match = match[1];

    		for (i = 0; i < 3; i++) {
    			// https://jsperf.com/slice-vs-substr-vs-substring-methods-long-string/19
    			var i2 = i * 2;
    			rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
    		}

    		if (hexAlpha) {
    			rgb[3] = parseInt(hexAlpha, 16) / 255;
    		}
    	} else if (match = string.match(abbr)) {
    		match = match[1];
    		hexAlpha = match[3];

    		for (i = 0; i < 3; i++) {
    			rgb[i] = parseInt(match[i] + match[i], 16);
    		}

    		if (hexAlpha) {
    			rgb[3] = parseInt(hexAlpha + hexAlpha, 16) / 255;
    		}
    	} else if (match = string.match(rgba)) {
    		for (i = 0; i < 3; i++) {
    			rgb[i] = parseInt(match[i + 1], 0);
    		}

    		if (match[4]) {
    			rgb[3] = parseFloat(match[4]);
    		}
    	} else if (match = string.match(per)) {
    		for (i = 0; i < 3; i++) {
    			rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
    		}

    		if (match[4]) {
    			rgb[3] = parseFloat(match[4]);
    		}
    	} else if (match = string.match(keyword)) {
    		if (match[1] === 'transparent') {
    			return [0, 0, 0, 0];
    		}

    		rgb = colorName$1[match[1]];

    		if (!rgb) {
    			return null;
    		}

    		rgb[3] = 1;

    		return rgb;
    	} else {
    		return null;
    	}

    	for (i = 0; i < 3; i++) {
    		rgb[i] = clamp(rgb[i], 0, 255);
    	}
    	rgb[3] = clamp(rgb[3], 0, 1);

    	return rgb;
    };

    cs.get.hsl = function (string) {
    	if (!string) {
    		return null;
    	}

    	var hsl = /^hsla?\(\s*([+-]?(?:\d{0,3}\.)?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
    	var match = string.match(hsl);

    	if (match) {
    		var alpha = parseFloat(match[4]);
    		var h = (parseFloat(match[1]) + 360) % 360;
    		var s = clamp(parseFloat(match[2]), 0, 100);
    		var l = clamp(parseFloat(match[3]), 0, 100);
    		var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);

    		return [h, s, l, a];
    	}

    	return null;
    };

    cs.get.hwb = function (string) {
    	if (!string) {
    		return null;
    	}

    	var hwb = /^hwb\(\s*([+-]?\d{0,3}(?:\.\d+)?)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
    	var match = string.match(hwb);

    	if (match) {
    		var alpha = parseFloat(match[4]);
    		var h = ((parseFloat(match[1]) % 360) + 360) % 360;
    		var w = clamp(parseFloat(match[2]), 0, 100);
    		var b = clamp(parseFloat(match[3]), 0, 100);
    		var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
    		return [h, w, b, a];
    	}

    	return null;
    };

    cs.to.hex = function () {
    	var rgba = simpleSwizzle(arguments);

    	return (
    		'#' +
    		hexDouble(rgba[0]) +
    		hexDouble(rgba[1]) +
    		hexDouble(rgba[2]) +
    		(rgba[3] < 1
    			? (hexDouble(Math.round(rgba[3] * 255)))
    			: '')
    	);
    };

    cs.to.rgb = function () {
    	var rgba = simpleSwizzle(arguments);

    	return rgba.length < 4 || rgba[3] === 1
    		? 'rgb(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ')'
    		: 'rgba(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ', ' + rgba[3] + ')';
    };

    cs.to.rgb.percent = function () {
    	var rgba = simpleSwizzle(arguments);

    	var r = Math.round(rgba[0] / 255 * 100);
    	var g = Math.round(rgba[1] / 255 * 100);
    	var b = Math.round(rgba[2] / 255 * 100);

    	return rgba.length < 4 || rgba[3] === 1
    		? 'rgb(' + r + '%, ' + g + '%, ' + b + '%)'
    		: 'rgba(' + r + '%, ' + g + '%, ' + b + '%, ' + rgba[3] + ')';
    };

    cs.to.hsl = function () {
    	var hsla = simpleSwizzle(arguments);
    	return hsla.length < 4 || hsla[3] === 1
    		? 'hsl(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%)'
    		: 'hsla(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%, ' + hsla[3] + ')';
    };

    // hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax
    // (hwb have alpha optional & 1 is default value)
    cs.to.hwb = function () {
    	var hwba = simpleSwizzle(arguments);

    	var a = '';
    	if (hwba.length >= 4 && hwba[3] !== 1) {
    		a = ', ' + hwba[3];
    	}

    	return 'hwb(' + hwba[0] + ', ' + hwba[1] + '%, ' + hwba[2] + '%' + a + ')';
    };

    cs.to.keyword = function (rgb) {
    	return reverseNames[rgb.slice(0, 3)];
    };

    // helpers
    function clamp(num, min, max) {
    	return Math.min(Math.max(min, num), max);
    }

    function hexDouble(num) {
    	var str = num.toString(16).toUpperCase();
    	return (str.length < 2) ? '0' + str : str;
    }
    });

    var colorName = {
    	"aliceblue": [240, 248, 255],
    	"antiquewhite": [250, 235, 215],
    	"aqua": [0, 255, 255],
    	"aquamarine": [127, 255, 212],
    	"azure": [240, 255, 255],
    	"beige": [245, 245, 220],
    	"bisque": [255, 228, 196],
    	"black": [0, 0, 0],
    	"blanchedalmond": [255, 235, 205],
    	"blue": [0, 0, 255],
    	"blueviolet": [138, 43, 226],
    	"brown": [165, 42, 42],
    	"burlywood": [222, 184, 135],
    	"cadetblue": [95, 158, 160],
    	"chartreuse": [127, 255, 0],
    	"chocolate": [210, 105, 30],
    	"coral": [255, 127, 80],
    	"cornflowerblue": [100, 149, 237],
    	"cornsilk": [255, 248, 220],
    	"crimson": [220, 20, 60],
    	"cyan": [0, 255, 255],
    	"darkblue": [0, 0, 139],
    	"darkcyan": [0, 139, 139],
    	"darkgoldenrod": [184, 134, 11],
    	"darkgray": [169, 169, 169],
    	"darkgreen": [0, 100, 0],
    	"darkgrey": [169, 169, 169],
    	"darkkhaki": [189, 183, 107],
    	"darkmagenta": [139, 0, 139],
    	"darkolivegreen": [85, 107, 47],
    	"darkorange": [255, 140, 0],
    	"darkorchid": [153, 50, 204],
    	"darkred": [139, 0, 0],
    	"darksalmon": [233, 150, 122],
    	"darkseagreen": [143, 188, 143],
    	"darkslateblue": [72, 61, 139],
    	"darkslategray": [47, 79, 79],
    	"darkslategrey": [47, 79, 79],
    	"darkturquoise": [0, 206, 209],
    	"darkviolet": [148, 0, 211],
    	"deeppink": [255, 20, 147],
    	"deepskyblue": [0, 191, 255],
    	"dimgray": [105, 105, 105],
    	"dimgrey": [105, 105, 105],
    	"dodgerblue": [30, 144, 255],
    	"firebrick": [178, 34, 34],
    	"floralwhite": [255, 250, 240],
    	"forestgreen": [34, 139, 34],
    	"fuchsia": [255, 0, 255],
    	"gainsboro": [220, 220, 220],
    	"ghostwhite": [248, 248, 255],
    	"gold": [255, 215, 0],
    	"goldenrod": [218, 165, 32],
    	"gray": [128, 128, 128],
    	"green": [0, 128, 0],
    	"greenyellow": [173, 255, 47],
    	"grey": [128, 128, 128],
    	"honeydew": [240, 255, 240],
    	"hotpink": [255, 105, 180],
    	"indianred": [205, 92, 92],
    	"indigo": [75, 0, 130],
    	"ivory": [255, 255, 240],
    	"khaki": [240, 230, 140],
    	"lavender": [230, 230, 250],
    	"lavenderblush": [255, 240, 245],
    	"lawngreen": [124, 252, 0],
    	"lemonchiffon": [255, 250, 205],
    	"lightblue": [173, 216, 230],
    	"lightcoral": [240, 128, 128],
    	"lightcyan": [224, 255, 255],
    	"lightgoldenrodyellow": [250, 250, 210],
    	"lightgray": [211, 211, 211],
    	"lightgreen": [144, 238, 144],
    	"lightgrey": [211, 211, 211],
    	"lightpink": [255, 182, 193],
    	"lightsalmon": [255, 160, 122],
    	"lightseagreen": [32, 178, 170],
    	"lightskyblue": [135, 206, 250],
    	"lightslategray": [119, 136, 153],
    	"lightslategrey": [119, 136, 153],
    	"lightsteelblue": [176, 196, 222],
    	"lightyellow": [255, 255, 224],
    	"lime": [0, 255, 0],
    	"limegreen": [50, 205, 50],
    	"linen": [250, 240, 230],
    	"magenta": [255, 0, 255],
    	"maroon": [128, 0, 0],
    	"mediumaquamarine": [102, 205, 170],
    	"mediumblue": [0, 0, 205],
    	"mediumorchid": [186, 85, 211],
    	"mediumpurple": [147, 112, 219],
    	"mediumseagreen": [60, 179, 113],
    	"mediumslateblue": [123, 104, 238],
    	"mediumspringgreen": [0, 250, 154],
    	"mediumturquoise": [72, 209, 204],
    	"mediumvioletred": [199, 21, 133],
    	"midnightblue": [25, 25, 112],
    	"mintcream": [245, 255, 250],
    	"mistyrose": [255, 228, 225],
    	"moccasin": [255, 228, 181],
    	"navajowhite": [255, 222, 173],
    	"navy": [0, 0, 128],
    	"oldlace": [253, 245, 230],
    	"olive": [128, 128, 0],
    	"olivedrab": [107, 142, 35],
    	"orange": [255, 165, 0],
    	"orangered": [255, 69, 0],
    	"orchid": [218, 112, 214],
    	"palegoldenrod": [238, 232, 170],
    	"palegreen": [152, 251, 152],
    	"paleturquoise": [175, 238, 238],
    	"palevioletred": [219, 112, 147],
    	"papayawhip": [255, 239, 213],
    	"peachpuff": [255, 218, 185],
    	"peru": [205, 133, 63],
    	"pink": [255, 192, 203],
    	"plum": [221, 160, 221],
    	"powderblue": [176, 224, 230],
    	"purple": [128, 0, 128],
    	"rebeccapurple": [102, 51, 153],
    	"red": [255, 0, 0],
    	"rosybrown": [188, 143, 143],
    	"royalblue": [65, 105, 225],
    	"saddlebrown": [139, 69, 19],
    	"salmon": [250, 128, 114],
    	"sandybrown": [244, 164, 96],
    	"seagreen": [46, 139, 87],
    	"seashell": [255, 245, 238],
    	"sienna": [160, 82, 45],
    	"silver": [192, 192, 192],
    	"skyblue": [135, 206, 235],
    	"slateblue": [106, 90, 205],
    	"slategray": [112, 128, 144],
    	"slategrey": [112, 128, 144],
    	"snow": [255, 250, 250],
    	"springgreen": [0, 255, 127],
    	"steelblue": [70, 130, 180],
    	"tan": [210, 180, 140],
    	"teal": [0, 128, 128],
    	"thistle": [216, 191, 216],
    	"tomato": [255, 99, 71],
    	"turquoise": [64, 224, 208],
    	"violet": [238, 130, 238],
    	"wheat": [245, 222, 179],
    	"white": [255, 255, 255],
    	"whitesmoke": [245, 245, 245],
    	"yellow": [255, 255, 0],
    	"yellowgreen": [154, 205, 50]
    };

    /* MIT license */

    var conversions = createCommonjsModule(function (module) {
    // NOTE: conversions should only return primitive values (i.e. arrays, or
    //       values that give correct `typeof` results).
    //       do not use box values types (i.e. Number(), String(), etc.)

    var reverseKeywords = {};
    for (var key in colorName) {
    	if (colorName.hasOwnProperty(key)) {
    		reverseKeywords[colorName[key]] = key;
    	}
    }

    var convert = module.exports = {
    	rgb: {channels: 3, labels: 'rgb'},
    	hsl: {channels: 3, labels: 'hsl'},
    	hsv: {channels: 3, labels: 'hsv'},
    	hwb: {channels: 3, labels: 'hwb'},
    	cmyk: {channels: 4, labels: 'cmyk'},
    	xyz: {channels: 3, labels: 'xyz'},
    	lab: {channels: 3, labels: 'lab'},
    	lch: {channels: 3, labels: 'lch'},
    	hex: {channels: 1, labels: ['hex']},
    	keyword: {channels: 1, labels: ['keyword']},
    	ansi16: {channels: 1, labels: ['ansi16']},
    	ansi256: {channels: 1, labels: ['ansi256']},
    	hcg: {channels: 3, labels: ['h', 'c', 'g']},
    	apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
    	gray: {channels: 1, labels: ['gray']}
    };

    // hide .channels and .labels properties
    for (var model in convert) {
    	if (convert.hasOwnProperty(model)) {
    		if (!('channels' in convert[model])) {
    			throw new Error('missing channels property: ' + model);
    		}

    		if (!('labels' in convert[model])) {
    			throw new Error('missing channel labels property: ' + model);
    		}

    		if (convert[model].labels.length !== convert[model].channels) {
    			throw new Error('channel and label counts mismatch: ' + model);
    		}

    		var channels = convert[model].channels;
    		var labels = convert[model].labels;
    		delete convert[model].channels;
    		delete convert[model].labels;
    		Object.defineProperty(convert[model], 'channels', {value: channels});
    		Object.defineProperty(convert[model], 'labels', {value: labels});
    	}
    }

    convert.rgb.hsl = function (rgb) {
    	var r = rgb[0] / 255;
    	var g = rgb[1] / 255;
    	var b = rgb[2] / 255;
    	var min = Math.min(r, g, b);
    	var max = Math.max(r, g, b);
    	var delta = max - min;
    	var h;
    	var s;
    	var l;

    	if (max === min) {
    		h = 0;
    	} else if (r === max) {
    		h = (g - b) / delta;
    	} else if (g === max) {
    		h = 2 + (b - r) / delta;
    	} else if (b === max) {
    		h = 4 + (r - g) / delta;
    	}

    	h = Math.min(h * 60, 360);

    	if (h < 0) {
    		h += 360;
    	}

    	l = (min + max) / 2;

    	if (max === min) {
    		s = 0;
    	} else if (l <= 0.5) {
    		s = delta / (max + min);
    	} else {
    		s = delta / (2 - max - min);
    	}

    	return [h, s * 100, l * 100];
    };

    convert.rgb.hsv = function (rgb) {
    	var rdif;
    	var gdif;
    	var bdif;
    	var h;
    	var s;

    	var r = rgb[0] / 255;
    	var g = rgb[1] / 255;
    	var b = rgb[2] / 255;
    	var v = Math.max(r, g, b);
    	var diff = v - Math.min(r, g, b);
    	var diffc = function (c) {
    		return (v - c) / 6 / diff + 1 / 2;
    	};

    	if (diff === 0) {
    		h = s = 0;
    	} else {
    		s = diff / v;
    		rdif = diffc(r);
    		gdif = diffc(g);
    		bdif = diffc(b);

    		if (r === v) {
    			h = bdif - gdif;
    		} else if (g === v) {
    			h = (1 / 3) + rdif - bdif;
    		} else if (b === v) {
    			h = (2 / 3) + gdif - rdif;
    		}
    		if (h < 0) {
    			h += 1;
    		} else if (h > 1) {
    			h -= 1;
    		}
    	}

    	return [
    		h * 360,
    		s * 100,
    		v * 100
    	];
    };

    convert.rgb.hwb = function (rgb) {
    	var r = rgb[0];
    	var g = rgb[1];
    	var b = rgb[2];
    	var h = convert.rgb.hsl(rgb)[0];
    	var w = 1 / 255 * Math.min(r, Math.min(g, b));

    	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

    	return [h, w * 100, b * 100];
    };

    convert.rgb.cmyk = function (rgb) {
    	var r = rgb[0] / 255;
    	var g = rgb[1] / 255;
    	var b = rgb[2] / 255;
    	var c;
    	var m;
    	var y;
    	var k;

    	k = Math.min(1 - r, 1 - g, 1 - b);
    	c = (1 - r - k) / (1 - k) || 0;
    	m = (1 - g - k) / (1 - k) || 0;
    	y = (1 - b - k) / (1 - k) || 0;

    	return [c * 100, m * 100, y * 100, k * 100];
    };

    /**
     * See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
     * */
    function comparativeDistance(x, y) {
    	return (
    		Math.pow(x[0] - y[0], 2) +
    		Math.pow(x[1] - y[1], 2) +
    		Math.pow(x[2] - y[2], 2)
    	);
    }

    convert.rgb.keyword = function (rgb) {
    	var reversed = reverseKeywords[rgb];
    	if (reversed) {
    		return reversed;
    	}

    	var currentClosestDistance = Infinity;
    	var currentClosestKeyword;

    	for (var keyword in colorName) {
    		if (colorName.hasOwnProperty(keyword)) {
    			var value = colorName[keyword];

    			// Compute comparative distance
    			var distance = comparativeDistance(rgb, value);

    			// Check if its less, if so set as closest
    			if (distance < currentClosestDistance) {
    				currentClosestDistance = distance;
    				currentClosestKeyword = keyword;
    			}
    		}
    	}

    	return currentClosestKeyword;
    };

    convert.keyword.rgb = function (keyword) {
    	return colorName[keyword];
    };

    convert.rgb.xyz = function (rgb) {
    	var r = rgb[0] / 255;
    	var g = rgb[1] / 255;
    	var b = rgb[2] / 255;

    	// assume sRGB
    	r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
    	g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
    	b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

    	var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
    	var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
    	var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

    	return [x * 100, y * 100, z * 100];
    };

    convert.rgb.lab = function (rgb) {
    	var xyz = convert.rgb.xyz(rgb);
    	var x = xyz[0];
    	var y = xyz[1];
    	var z = xyz[2];
    	var l;
    	var a;
    	var b;

    	x /= 95.047;
    	y /= 100;
    	z /= 108.883;

    	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
    	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
    	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

    	l = (116 * y) - 16;
    	a = 500 * (x - y);
    	b = 200 * (y - z);

    	return [l, a, b];
    };

    convert.hsl.rgb = function (hsl) {
    	var h = hsl[0] / 360;
    	var s = hsl[1] / 100;
    	var l = hsl[2] / 100;
    	var t1;
    	var t2;
    	var t3;
    	var rgb;
    	var val;

    	if (s === 0) {
    		val = l * 255;
    		return [val, val, val];
    	}

    	if (l < 0.5) {
    		t2 = l * (1 + s);
    	} else {
    		t2 = l + s - l * s;
    	}

    	t1 = 2 * l - t2;

    	rgb = [0, 0, 0];
    	for (var i = 0; i < 3; i++) {
    		t3 = h + 1 / 3 * -(i - 1);
    		if (t3 < 0) {
    			t3++;
    		}
    		if (t3 > 1) {
    			t3--;
    		}

    		if (6 * t3 < 1) {
    			val = t1 + (t2 - t1) * 6 * t3;
    		} else if (2 * t3 < 1) {
    			val = t2;
    		} else if (3 * t3 < 2) {
    			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
    		} else {
    			val = t1;
    		}

    		rgb[i] = val * 255;
    	}

    	return rgb;
    };

    convert.hsl.hsv = function (hsl) {
    	var h = hsl[0];
    	var s = hsl[1] / 100;
    	var l = hsl[2] / 100;
    	var smin = s;
    	var lmin = Math.max(l, 0.01);
    	var sv;
    	var v;

    	l *= 2;
    	s *= (l <= 1) ? l : 2 - l;
    	smin *= lmin <= 1 ? lmin : 2 - lmin;
    	v = (l + s) / 2;
    	sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

    	return [h, sv * 100, v * 100];
    };

    convert.hsv.rgb = function (hsv) {
    	var h = hsv[0] / 60;
    	var s = hsv[1] / 100;
    	var v = hsv[2] / 100;
    	var hi = Math.floor(h) % 6;

    	var f = h - Math.floor(h);
    	var p = 255 * v * (1 - s);
    	var q = 255 * v * (1 - (s * f));
    	var t = 255 * v * (1 - (s * (1 - f)));
    	v *= 255;

    	switch (hi) {
    		case 0:
    			return [v, t, p];
    		case 1:
    			return [q, v, p];
    		case 2:
    			return [p, v, t];
    		case 3:
    			return [p, q, v];
    		case 4:
    			return [t, p, v];
    		case 5:
    			return [v, p, q];
    	}
    };

    convert.hsv.hsl = function (hsv) {
    	var h = hsv[0];
    	var s = hsv[1] / 100;
    	var v = hsv[2] / 100;
    	var vmin = Math.max(v, 0.01);
    	var lmin;
    	var sl;
    	var l;

    	l = (2 - s) * v;
    	lmin = (2 - s) * vmin;
    	sl = s * vmin;
    	sl /= (lmin <= 1) ? lmin : 2 - lmin;
    	sl = sl || 0;
    	l /= 2;

    	return [h, sl * 100, l * 100];
    };

    // http://dev.w3.org/csswg/css-color/#hwb-to-rgb
    convert.hwb.rgb = function (hwb) {
    	var h = hwb[0] / 360;
    	var wh = hwb[1] / 100;
    	var bl = hwb[2] / 100;
    	var ratio = wh + bl;
    	var i;
    	var v;
    	var f;
    	var n;

    	// wh + bl cant be > 1
    	if (ratio > 1) {
    		wh /= ratio;
    		bl /= ratio;
    	}

    	i = Math.floor(6 * h);
    	v = 1 - bl;
    	f = 6 * h - i;

    	if ((i & 0x01) !== 0) {
    		f = 1 - f;
    	}

    	n = wh + f * (v - wh); // linear interpolation

    	var r;
    	var g;
    	var b;
    	switch (i) {
    		default:
    		case 6:
    		case 0: r = v; g = n; b = wh; break;
    		case 1: r = n; g = v; b = wh; break;
    		case 2: r = wh; g = v; b = n; break;
    		case 3: r = wh; g = n; b = v; break;
    		case 4: r = n; g = wh; b = v; break;
    		case 5: r = v; g = wh; b = n; break;
    	}

    	return [r * 255, g * 255, b * 255];
    };

    convert.cmyk.rgb = function (cmyk) {
    	var c = cmyk[0] / 100;
    	var m = cmyk[1] / 100;
    	var y = cmyk[2] / 100;
    	var k = cmyk[3] / 100;
    	var r;
    	var g;
    	var b;

    	r = 1 - Math.min(1, c * (1 - k) + k);
    	g = 1 - Math.min(1, m * (1 - k) + k);
    	b = 1 - Math.min(1, y * (1 - k) + k);

    	return [r * 255, g * 255, b * 255];
    };

    convert.xyz.rgb = function (xyz) {
    	var x = xyz[0] / 100;
    	var y = xyz[1] / 100;
    	var z = xyz[2] / 100;
    	var r;
    	var g;
    	var b;

    	r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
    	g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
    	b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

    	// assume sRGB
    	r = r > 0.0031308
    		? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
    		: r * 12.92;

    	g = g > 0.0031308
    		? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
    		: g * 12.92;

    	b = b > 0.0031308
    		? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
    		: b * 12.92;

    	r = Math.min(Math.max(0, r), 1);
    	g = Math.min(Math.max(0, g), 1);
    	b = Math.min(Math.max(0, b), 1);

    	return [r * 255, g * 255, b * 255];
    };

    convert.xyz.lab = function (xyz) {
    	var x = xyz[0];
    	var y = xyz[1];
    	var z = xyz[2];
    	var l;
    	var a;
    	var b;

    	x /= 95.047;
    	y /= 100;
    	z /= 108.883;

    	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
    	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
    	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

    	l = (116 * y) - 16;
    	a = 500 * (x - y);
    	b = 200 * (y - z);

    	return [l, a, b];
    };

    convert.lab.xyz = function (lab) {
    	var l = lab[0];
    	var a = lab[1];
    	var b = lab[2];
    	var x;
    	var y;
    	var z;

    	y = (l + 16) / 116;
    	x = a / 500 + y;
    	z = y - b / 200;

    	var y2 = Math.pow(y, 3);
    	var x2 = Math.pow(x, 3);
    	var z2 = Math.pow(z, 3);
    	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
    	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
    	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

    	x *= 95.047;
    	y *= 100;
    	z *= 108.883;

    	return [x, y, z];
    };

    convert.lab.lch = function (lab) {
    	var l = lab[0];
    	var a = lab[1];
    	var b = lab[2];
    	var hr;
    	var h;
    	var c;

    	hr = Math.atan2(b, a);
    	h = hr * 360 / 2 / Math.PI;

    	if (h < 0) {
    		h += 360;
    	}

    	c = Math.sqrt(a * a + b * b);

    	return [l, c, h];
    };

    convert.lch.lab = function (lch) {
    	var l = lch[0];
    	var c = lch[1];
    	var h = lch[2];
    	var a;
    	var b;
    	var hr;

    	hr = h / 360 * 2 * Math.PI;
    	a = c * Math.cos(hr);
    	b = c * Math.sin(hr);

    	return [l, a, b];
    };

    convert.rgb.ansi16 = function (args) {
    	var r = args[0];
    	var g = args[1];
    	var b = args[2];
    	var value = 1 in arguments ? arguments[1] : convert.rgb.hsv(args)[2]; // hsv -> ansi16 optimization

    	value = Math.round(value / 50);

    	if (value === 0) {
    		return 30;
    	}

    	var ansi = 30
    		+ ((Math.round(b / 255) << 2)
    		| (Math.round(g / 255) << 1)
    		| Math.round(r / 255));

    	if (value === 2) {
    		ansi += 60;
    	}

    	return ansi;
    };

    convert.hsv.ansi16 = function (args) {
    	// optimization here; we already know the value and don't need to get
    	// it converted for us.
    	return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
    };

    convert.rgb.ansi256 = function (args) {
    	var r = args[0];
    	var g = args[1];
    	var b = args[2];

    	// we use the extended greyscale palette here, with the exception of
    	// black and white. normal palette only has 4 greyscale shades.
    	if (r === g && g === b) {
    		if (r < 8) {
    			return 16;
    		}

    		if (r > 248) {
    			return 231;
    		}

    		return Math.round(((r - 8) / 247) * 24) + 232;
    	}

    	var ansi = 16
    		+ (36 * Math.round(r / 255 * 5))
    		+ (6 * Math.round(g / 255 * 5))
    		+ Math.round(b / 255 * 5);

    	return ansi;
    };

    convert.ansi16.rgb = function (args) {
    	var color = args % 10;

    	// handle greyscale
    	if (color === 0 || color === 7) {
    		if (args > 50) {
    			color += 3.5;
    		}

    		color = color / 10.5 * 255;

    		return [color, color, color];
    	}

    	var mult = (~~(args > 50) + 1) * 0.5;
    	var r = ((color & 1) * mult) * 255;
    	var g = (((color >> 1) & 1) * mult) * 255;
    	var b = (((color >> 2) & 1) * mult) * 255;

    	return [r, g, b];
    };

    convert.ansi256.rgb = function (args) {
    	// handle greyscale
    	if (args >= 232) {
    		var c = (args - 232) * 10 + 8;
    		return [c, c, c];
    	}

    	args -= 16;

    	var rem;
    	var r = Math.floor(args / 36) / 5 * 255;
    	var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
    	var b = (rem % 6) / 5 * 255;

    	return [r, g, b];
    };

    convert.rgb.hex = function (args) {
    	var integer = ((Math.round(args[0]) & 0xFF) << 16)
    		+ ((Math.round(args[1]) & 0xFF) << 8)
    		+ (Math.round(args[2]) & 0xFF);

    	var string = integer.toString(16).toUpperCase();
    	return '000000'.substring(string.length) + string;
    };

    convert.hex.rgb = function (args) {
    	var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
    	if (!match) {
    		return [0, 0, 0];
    	}

    	var colorString = match[0];

    	if (match[0].length === 3) {
    		colorString = colorString.split('').map(function (char) {
    			return char + char;
    		}).join('');
    	}

    	var integer = parseInt(colorString, 16);
    	var r = (integer >> 16) & 0xFF;
    	var g = (integer >> 8) & 0xFF;
    	var b = integer & 0xFF;

    	return [r, g, b];
    };

    convert.rgb.hcg = function (rgb) {
    	var r = rgb[0] / 255;
    	var g = rgb[1] / 255;
    	var b = rgb[2] / 255;
    	var max = Math.max(Math.max(r, g), b);
    	var min = Math.min(Math.min(r, g), b);
    	var chroma = (max - min);
    	var grayscale;
    	var hue;

    	if (chroma < 1) {
    		grayscale = min / (1 - chroma);
    	} else {
    		grayscale = 0;
    	}

    	if (chroma <= 0) {
    		hue = 0;
    	} else
    	if (max === r) {
    		hue = ((g - b) / chroma) % 6;
    	} else
    	if (max === g) {
    		hue = 2 + (b - r) / chroma;
    	} else {
    		hue = 4 + (r - g) / chroma + 4;
    	}

    	hue /= 6;
    	hue %= 1;

    	return [hue * 360, chroma * 100, grayscale * 100];
    };

    convert.hsl.hcg = function (hsl) {
    	var s = hsl[1] / 100;
    	var l = hsl[2] / 100;
    	var c = 1;
    	var f = 0;

    	if (l < 0.5) {
    		c = 2.0 * s * l;
    	} else {
    		c = 2.0 * s * (1.0 - l);
    	}

    	if (c < 1.0) {
    		f = (l - 0.5 * c) / (1.0 - c);
    	}

    	return [hsl[0], c * 100, f * 100];
    };

    convert.hsv.hcg = function (hsv) {
    	var s = hsv[1] / 100;
    	var v = hsv[2] / 100;

    	var c = s * v;
    	var f = 0;

    	if (c < 1.0) {
    		f = (v - c) / (1 - c);
    	}

    	return [hsv[0], c * 100, f * 100];
    };

    convert.hcg.rgb = function (hcg) {
    	var h = hcg[0] / 360;
    	var c = hcg[1] / 100;
    	var g = hcg[2] / 100;

    	if (c === 0.0) {
    		return [g * 255, g * 255, g * 255];
    	}

    	var pure = [0, 0, 0];
    	var hi = (h % 1) * 6;
    	var v = hi % 1;
    	var w = 1 - v;
    	var mg = 0;

    	switch (Math.floor(hi)) {
    		case 0:
    			pure[0] = 1; pure[1] = v; pure[2] = 0; break;
    		case 1:
    			pure[0] = w; pure[1] = 1; pure[2] = 0; break;
    		case 2:
    			pure[0] = 0; pure[1] = 1; pure[2] = v; break;
    		case 3:
    			pure[0] = 0; pure[1] = w; pure[2] = 1; break;
    		case 4:
    			pure[0] = v; pure[1] = 0; pure[2] = 1; break;
    		default:
    			pure[0] = 1; pure[1] = 0; pure[2] = w;
    	}

    	mg = (1.0 - c) * g;

    	return [
    		(c * pure[0] + mg) * 255,
    		(c * pure[1] + mg) * 255,
    		(c * pure[2] + mg) * 255
    	];
    };

    convert.hcg.hsv = function (hcg) {
    	var c = hcg[1] / 100;
    	var g = hcg[2] / 100;

    	var v = c + g * (1.0 - c);
    	var f = 0;

    	if (v > 0.0) {
    		f = c / v;
    	}

    	return [hcg[0], f * 100, v * 100];
    };

    convert.hcg.hsl = function (hcg) {
    	var c = hcg[1] / 100;
    	var g = hcg[2] / 100;

    	var l = g * (1.0 - c) + 0.5 * c;
    	var s = 0;

    	if (l > 0.0 && l < 0.5) {
    		s = c / (2 * l);
    	} else
    	if (l >= 0.5 && l < 1.0) {
    		s = c / (2 * (1 - l));
    	}

    	return [hcg[0], s * 100, l * 100];
    };

    convert.hcg.hwb = function (hcg) {
    	var c = hcg[1] / 100;
    	var g = hcg[2] / 100;
    	var v = c + g * (1.0 - c);
    	return [hcg[0], (v - c) * 100, (1 - v) * 100];
    };

    convert.hwb.hcg = function (hwb) {
    	var w = hwb[1] / 100;
    	var b = hwb[2] / 100;
    	var v = 1 - b;
    	var c = v - w;
    	var g = 0;

    	if (c < 1) {
    		g = (v - c) / (1 - c);
    	}

    	return [hwb[0], c * 100, g * 100];
    };

    convert.apple.rgb = function (apple) {
    	return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
    };

    convert.rgb.apple = function (rgb) {
    	return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
    };

    convert.gray.rgb = function (args) {
    	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
    };

    convert.gray.hsl = convert.gray.hsv = function (args) {
    	return [0, 0, args[0]];
    };

    convert.gray.hwb = function (gray) {
    	return [0, 100, gray[0]];
    };

    convert.gray.cmyk = function (gray) {
    	return [0, 0, 0, gray[0]];
    };

    convert.gray.lab = function (gray) {
    	return [gray[0], 0, 0];
    };

    convert.gray.hex = function (gray) {
    	var val = Math.round(gray[0] / 100 * 255) & 0xFF;
    	var integer = (val << 16) + (val << 8) + val;

    	var string = integer.toString(16).toUpperCase();
    	return '000000'.substring(string.length) + string;
    };

    convert.rgb.gray = function (rgb) {
    	var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
    	return [val / 255 * 100];
    };
    });

    /*
    	this function routes a model to all other models.

    	all functions that are routed have a property `.conversion` attached
    	to the returned synthetic function. This property is an array
    	of strings, each with the steps in between the 'from' and 'to'
    	color models (inclusive).

    	conversions that are not possible simply are not included.
    */

    function buildGraph() {
    	var graph = {};
    	// https://jsperf.com/object-keys-vs-for-in-with-closure/3
    	var models = Object.keys(conversions);

    	for (var len = models.length, i = 0; i < len; i++) {
    		graph[models[i]] = {
    			// http://jsperf.com/1-vs-infinity
    			// micro-opt, but this is simple.
    			distance: -1,
    			parent: null
    		};
    	}

    	return graph;
    }

    // https://en.wikipedia.org/wiki/Breadth-first_search
    function deriveBFS(fromModel) {
    	var graph = buildGraph();
    	var queue = [fromModel]; // unshift -> queue -> pop

    	graph[fromModel].distance = 0;

    	while (queue.length) {
    		var current = queue.pop();
    		var adjacents = Object.keys(conversions[current]);

    		for (var len = adjacents.length, i = 0; i < len; i++) {
    			var adjacent = adjacents[i];
    			var node = graph[adjacent];

    			if (node.distance === -1) {
    				node.distance = graph[current].distance + 1;
    				node.parent = current;
    				queue.unshift(adjacent);
    			}
    		}
    	}

    	return graph;
    }

    function link(from, to) {
    	return function (args) {
    		return to(from(args));
    	};
    }

    function wrapConversion(toModel, graph) {
    	var path = [graph[toModel].parent, toModel];
    	var fn = conversions[graph[toModel].parent][toModel];

    	var cur = graph[toModel].parent;
    	while (graph[cur].parent) {
    		path.unshift(graph[cur].parent);
    		fn = link(conversions[graph[cur].parent][cur], fn);
    		cur = graph[cur].parent;
    	}

    	fn.conversion = path;
    	return fn;
    }

    var route = function (fromModel) {
    	var graph = deriveBFS(fromModel);
    	var conversion = {};

    	var models = Object.keys(graph);
    	for (var len = models.length, i = 0; i < len; i++) {
    		var toModel = models[i];
    		var node = graph[toModel];

    		if (node.parent === null) {
    			// no possible conversion, or this node is the source model.
    			continue;
    		}

    		conversion[toModel] = wrapConversion(toModel, graph);
    	}

    	return conversion;
    };

    var convert = {};

    var models = Object.keys(conversions);

    function wrapRaw(fn) {
    	var wrappedFn = function (args) {
    		if (args === undefined || args === null) {
    			return args;
    		}

    		if (arguments.length > 1) {
    			args = Array.prototype.slice.call(arguments);
    		}

    		return fn(args);
    	};

    	// preserve .conversion property if there is one
    	if ('conversion' in fn) {
    		wrappedFn.conversion = fn.conversion;
    	}

    	return wrappedFn;
    }

    function wrapRounded(fn) {
    	var wrappedFn = function (args) {
    		if (args === undefined || args === null) {
    			return args;
    		}

    		if (arguments.length > 1) {
    			args = Array.prototype.slice.call(arguments);
    		}

    		var result = fn(args);

    		// we're assuming the result is an array here.
    		// see notice in conversions.js; don't use box types
    		// in conversion functions.
    		if (typeof result === 'object') {
    			for (var len = result.length, i = 0; i < len; i++) {
    				result[i] = Math.round(result[i]);
    			}
    		}

    		return result;
    	};

    	// preserve .conversion property if there is one
    	if ('conversion' in fn) {
    		wrappedFn.conversion = fn.conversion;
    	}

    	return wrappedFn;
    }

    models.forEach(function (fromModel) {
    	convert[fromModel] = {};

    	Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
    	Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

    	var routes = route(fromModel);
    	var routeModels = Object.keys(routes);

    	routeModels.forEach(function (toModel) {
    		var fn = routes[toModel];

    		convert[fromModel][toModel] = wrapRounded(fn);
    		convert[fromModel][toModel].raw = wrapRaw(fn);
    	});
    });

    var colorConvert = convert;

    var _slice = [].slice;

    var skippedModels = [
    	// to be honest, I don't really feel like keyword belongs in color convert, but eh.
    	'keyword',

    	// gray conflicts with some method names, and has its own method defined.
    	'gray',

    	// shouldn't really be in color-convert either...
    	'hex'
    ];

    var hashedModelKeys = {};
    Object.keys(colorConvert).forEach(function (model) {
    	hashedModelKeys[_slice.call(colorConvert[model].labels).sort().join('')] = model;
    });

    var limiters = {};

    function Color(obj, model) {
    	if (!(this instanceof Color)) {
    		return new Color(obj, model);
    	}

    	if (model && model in skippedModels) {
    		model = null;
    	}

    	if (model && !(model in colorConvert)) {
    		throw new Error('Unknown model: ' + model);
    	}

    	var i;
    	var channels;

    	if (obj == null) { // eslint-disable-line no-eq-null,eqeqeq
    		this.model = 'rgb';
    		this.color = [0, 0, 0];
    		this.valpha = 1;
    	} else if (obj instanceof Color) {
    		this.model = obj.model;
    		this.color = obj.color.slice();
    		this.valpha = obj.valpha;
    	} else if (typeof obj === 'string') {
    		var result = colorString.get(obj);
    		if (result === null) {
    			throw new Error('Unable to parse color from string: ' + obj);
    		}

    		this.model = result.model;
    		channels = colorConvert[this.model].channels;
    		this.color = result.value.slice(0, channels);
    		this.valpha = typeof result.value[channels] === 'number' ? result.value[channels] : 1;
    	} else if (obj.length) {
    		this.model = model || 'rgb';
    		channels = colorConvert[this.model].channels;
    		var newArr = _slice.call(obj, 0, channels);
    		this.color = zeroArray(newArr, channels);
    		this.valpha = typeof obj[channels] === 'number' ? obj[channels] : 1;
    	} else if (typeof obj === 'number') {
    		// this is always RGB - can be converted later on.
    		obj &= 0xFFFFFF;
    		this.model = 'rgb';
    		this.color = [
    			(obj >> 16) & 0xFF,
    			(obj >> 8) & 0xFF,
    			obj & 0xFF
    		];
    		this.valpha = 1;
    	} else {
    		this.valpha = 1;

    		var keys = Object.keys(obj);
    		if ('alpha' in obj) {
    			keys.splice(keys.indexOf('alpha'), 1);
    			this.valpha = typeof obj.alpha === 'number' ? obj.alpha : 0;
    		}

    		var hashedKeys = keys.sort().join('');
    		if (!(hashedKeys in hashedModelKeys)) {
    			throw new Error('Unable to parse color from object: ' + JSON.stringify(obj));
    		}

    		this.model = hashedModelKeys[hashedKeys];

    		var labels = colorConvert[this.model].labels;
    		var color = [];
    		for (i = 0; i < labels.length; i++) {
    			color.push(obj[labels[i]]);
    		}

    		this.color = zeroArray(color);
    	}

    	// perform limitations (clamping, etc.)
    	if (limiters[this.model]) {
    		channels = colorConvert[this.model].channels;
    		for (i = 0; i < channels; i++) {
    			var limit = limiters[this.model][i];
    			if (limit) {
    				this.color[i] = limit(this.color[i]);
    			}
    		}
    	}

    	this.valpha = Math.max(0, Math.min(1, this.valpha));

    	if (Object.freeze) {
    		Object.freeze(this);
    	}
    }

    Color.prototype = {
    	toString: function () {
    		return this.string();
    	},

    	toJSON: function () {
    		return this[this.model]();
    	},

    	string: function (places) {
    		var self = this.model in colorString.to ? this : this.rgb();
    		self = self.round(typeof places === 'number' ? places : 1);
    		var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
    		return colorString.to[self.model](args);
    	},

    	percentString: function (places) {
    		var self = this.rgb().round(typeof places === 'number' ? places : 1);
    		var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
    		return colorString.to.rgb.percent(args);
    	},

    	array: function () {
    		return this.valpha === 1 ? this.color.slice() : this.color.concat(this.valpha);
    	},

    	object: function () {
    		var result = {};
    		var channels = colorConvert[this.model].channels;
    		var labels = colorConvert[this.model].labels;

    		for (var i = 0; i < channels; i++) {
    			result[labels[i]] = this.color[i];
    		}

    		if (this.valpha !== 1) {
    			result.alpha = this.valpha;
    		}

    		return result;
    	},

    	unitArray: function () {
    		var rgb = this.rgb().color;
    		rgb[0] /= 255;
    		rgb[1] /= 255;
    		rgb[2] /= 255;

    		if (this.valpha !== 1) {
    			rgb.push(this.valpha);
    		}

    		return rgb;
    	},

    	unitObject: function () {
    		var rgb = this.rgb().object();
    		rgb.r /= 255;
    		rgb.g /= 255;
    		rgb.b /= 255;

    		if (this.valpha !== 1) {
    			rgb.alpha = this.valpha;
    		}

    		return rgb;
    	},

    	round: function (places) {
    		places = Math.max(places || 0, 0);
    		return new Color(this.color.map(roundToPlace(places)).concat(this.valpha), this.model);
    	},

    	alpha: function (val) {
    		if (arguments.length) {
    			return new Color(this.color.concat(Math.max(0, Math.min(1, val))), this.model);
    		}

    		return this.valpha;
    	},

    	// rgb
    	red: getset('rgb', 0, maxfn(255)),
    	green: getset('rgb', 1, maxfn(255)),
    	blue: getset('rgb', 2, maxfn(255)),

    	hue: getset(['hsl', 'hsv', 'hsl', 'hwb', 'hcg'], 0, function (val) { return ((val % 360) + 360) % 360; }), // eslint-disable-line brace-style

    	saturationl: getset('hsl', 1, maxfn(100)),
    	lightness: getset('hsl', 2, maxfn(100)),

    	saturationv: getset('hsv', 1, maxfn(100)),
    	value: getset('hsv', 2, maxfn(100)),

    	chroma: getset('hcg', 1, maxfn(100)),
    	gray: getset('hcg', 2, maxfn(100)),

    	white: getset('hwb', 1, maxfn(100)),
    	wblack: getset('hwb', 2, maxfn(100)),

    	cyan: getset('cmyk', 0, maxfn(100)),
    	magenta: getset('cmyk', 1, maxfn(100)),
    	yellow: getset('cmyk', 2, maxfn(100)),
    	black: getset('cmyk', 3, maxfn(100)),

    	x: getset('xyz', 0, maxfn(100)),
    	y: getset('xyz', 1, maxfn(100)),
    	z: getset('xyz', 2, maxfn(100)),

    	l: getset('lab', 0, maxfn(100)),
    	a: getset('lab', 1),
    	b: getset('lab', 2),

    	keyword: function (val) {
    		if (arguments.length) {
    			return new Color(val);
    		}

    		return colorConvert[this.model].keyword(this.color);
    	},

    	hex: function (val) {
    		if (arguments.length) {
    			return new Color(val);
    		}

    		return colorString.to.hex(this.rgb().round().color);
    	},

    	rgbNumber: function () {
    		var rgb = this.rgb().color;
    		return ((rgb[0] & 0xFF) << 16) | ((rgb[1] & 0xFF) << 8) | (rgb[2] & 0xFF);
    	},

    	luminosity: function () {
    		// http://www.w3.org/TR/WCAG20/#relativeluminancedef
    		var rgb = this.rgb().color;

    		var lum = [];
    		for (var i = 0; i < rgb.length; i++) {
    			var chan = rgb[i] / 255;
    			lum[i] = (chan <= 0.03928) ? chan / 12.92 : Math.pow(((chan + 0.055) / 1.055), 2.4);
    		}

    		return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
    	},

    	contrast: function (color2) {
    		// http://www.w3.org/TR/WCAG20/#contrast-ratiodef
    		var lum1 = this.luminosity();
    		var lum2 = color2.luminosity();

    		if (lum1 > lum2) {
    			return (lum1 + 0.05) / (lum2 + 0.05);
    		}

    		return (lum2 + 0.05) / (lum1 + 0.05);
    	},

    	level: function (color2) {
    		var contrastRatio = this.contrast(color2);
    		if (contrastRatio >= 7.1) {
    			return 'AAA';
    		}

    		return (contrastRatio >= 4.5) ? 'AA' : '';
    	},

    	isDark: function () {
    		// YIQ equation from http://24ways.org/2010/calculating-color-contrast
    		var rgb = this.rgb().color;
    		var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    		return yiq < 128;
    	},

    	isLight: function () {
    		return !this.isDark();
    	},

    	negate: function () {
    		var rgb = this.rgb();
    		for (var i = 0; i < 3; i++) {
    			rgb.color[i] = 255 - rgb.color[i];
    		}
    		return rgb;
    	},

    	lighten: function (ratio) {
    		var hsl = this.hsl();
    		hsl.color[2] += hsl.color[2] * ratio;
    		return hsl;
    	},

    	darken: function (ratio) {
    		var hsl = this.hsl();
    		hsl.color[2] -= hsl.color[2] * ratio;
    		return hsl;
    	},

    	saturate: function (ratio) {
    		var hsl = this.hsl();
    		hsl.color[1] += hsl.color[1] * ratio;
    		return hsl;
    	},

    	desaturate: function (ratio) {
    		var hsl = this.hsl();
    		hsl.color[1] -= hsl.color[1] * ratio;
    		return hsl;
    	},

    	whiten: function (ratio) {
    		var hwb = this.hwb();
    		hwb.color[1] += hwb.color[1] * ratio;
    		return hwb;
    	},

    	blacken: function (ratio) {
    		var hwb = this.hwb();
    		hwb.color[2] += hwb.color[2] * ratio;
    		return hwb;
    	},

    	grayscale: function () {
    		// http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
    		var rgb = this.rgb().color;
    		var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
    		return Color.rgb(val, val, val);
    	},

    	fade: function (ratio) {
    		return this.alpha(this.valpha - (this.valpha * ratio));
    	},

    	opaquer: function (ratio) {
    		return this.alpha(this.valpha + (this.valpha * ratio));
    	},

    	rotate: function (degrees) {
    		var hsl = this.hsl();
    		var hue = hsl.color[0];
    		hue = (hue + degrees) % 360;
    		hue = hue < 0 ? 360 + hue : hue;
    		hsl.color[0] = hue;
    		return hsl;
    	},

    	mix: function (mixinColor, weight) {
    		// ported from sass implementation in C
    		// https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209
    		if (!mixinColor || !mixinColor.rgb) {
    			throw new Error('Argument to "mix" was not a Color instance, but rather an instance of ' + typeof mixinColor);
    		}
    		var color1 = mixinColor.rgb();
    		var color2 = this.rgb();
    		var p = weight === undefined ? 0.5 : weight;

    		var w = 2 * p - 1;
    		var a = color1.alpha() - color2.alpha();

    		var w1 = (((w * a === -1) ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
    		var w2 = 1 - w1;

    		return Color.rgb(
    				w1 * color1.red() + w2 * color2.red(),
    				w1 * color1.green() + w2 * color2.green(),
    				w1 * color1.blue() + w2 * color2.blue(),
    				color1.alpha() * p + color2.alpha() * (1 - p));
    	}
    };

    // model conversion methods and static constructors
    Object.keys(colorConvert).forEach(function (model) {
    	if (skippedModels.indexOf(model) !== -1) {
    		return;
    	}

    	var channels = colorConvert[model].channels;

    	// conversion methods
    	Color.prototype[model] = function () {
    		if (this.model === model) {
    			return new Color(this);
    		}

    		if (arguments.length) {
    			return new Color(arguments, model);
    		}

    		var newAlpha = typeof arguments[channels] === 'number' ? channels : this.valpha;
    		return new Color(assertArray(colorConvert[this.model][model].raw(this.color)).concat(newAlpha), model);
    	};

    	// 'static' construction methods
    	Color[model] = function (color) {
    		if (typeof color === 'number') {
    			color = zeroArray(_slice.call(arguments), channels);
    		}
    		return new Color(color, model);
    	};
    });

    function roundTo(num, places) {
    	return Number(num.toFixed(places));
    }

    function roundToPlace(places) {
    	return function (num) {
    		return roundTo(num, places);
    	};
    }

    function getset(model, channel, modifier) {
    	model = Array.isArray(model) ? model : [model];

    	model.forEach(function (m) {
    		(limiters[m] || (limiters[m] = []))[channel] = modifier;
    	});

    	model = model[0];

    	return function (val) {
    		var result;

    		if (arguments.length) {
    			if (modifier) {
    				val = modifier(val);
    			}

    			result = this[model]();
    			result.color[channel] = val;
    			return result;
    		}

    		result = this[model]().color[channel];
    		if (modifier) {
    			result = modifier(result);
    		}

    		return result;
    	};
    }

    function maxfn(max) {
    	return function (v) {
    		return Math.max(0, Math.min(max, v));
    	};
    }

    function assertArray(val) {
    	return Array.isArray(val) ? val : [val];
    }

    function zeroArray(arr, length) {
    	for (var i = 0; i < length; i++) {
    		if (typeof arr[i] !== 'number') {
    			arr[i] = 0;
    		}
    	}

    	return arr;
    }

    var color = Color;

    /* src\App.svelte generated by Svelte v3.35.0 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div0;
    	let t0;
    	let div1;
    	let timer;
    	let t1;
    	let controls;
    	let t2;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	timer = new Timer({
    			props: {
    				size: /*windowWidth*/ ctx[0],
    				color: /*color*/ ctx[1]
    			},
    			$$inline: true
    		});

    	controls = new Controls({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			create_component(timer.$$.fragment);
    			t1 = space();
    			create_component(controls.$$.fragment);
    			t2 = space();
    			button = element("button");
    			button.textContent = "resize";
    			attr_dev(div0, "class", "draggableArea svelte-raszpu");
    			add_location(div0, file, 38, 1, 749);
    			add_location(button, file, 46, 2, 875);
    			attr_dev(div1, "class", "background svelte-raszpu");
    			add_location(div1, file, 39, 1, 784);
    			attr_dev(main, "class", "svelte-raszpu");
    			add_location(main, file, 37, 0, 741);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(main, t0);
    			append_dev(main, div1);
    			mount_component(timer, div1, null);
    			append_dev(div1, t1);
    			mount_component(controls, div1, null);
    			append_dev(div1, t2);
    			append_dev(div1, button);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*resize*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const timer_changes = {};
    			if (dirty & /*windowWidth*/ 1) timer_changes.size = /*windowWidth*/ ctx[0];
    			timer.$set(timer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timer.$$.fragment, local);
    			transition_in(controls.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timer.$$.fragment, local);
    			transition_out(controls.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(timer);
    			destroy_component(controls);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const { ipcRenderer } = require("electron");
    	let i = 0;
    	let sizes = [100, 150, 200, 250, 300, 350, 400, 450, 500];
    	let hue = 180;
    	let color$1 = color("rgb(255, 0, 0)").rotate(hue);
    	let { windowWidth = 300 } = $$props;

    	const resize = () => {
    		ipcRenderer.send("resize", sizes[i]);
    		$$invalidate(0, windowWidth = sizes[i]);
    		i = (i + 1) % sizes.length;
    		console.log("resize called");
    	};

    	const writable_props = ["windowWidth"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("windowWidth" in $$props) $$invalidate(0, windowWidth = $$props.windowWidth);
    	};

    	$$self.$capture_state = () => ({
    		Timer,
    		Controls,
    		ipcRenderer,
    		Color: color,
    		i,
    		sizes,
    		hue,
    		color: color$1,
    		windowWidth,
    		resize
    	});

    	$$self.$inject_state = $$props => {
    		if ("i" in $$props) i = $$props.i;
    		if ("sizes" in $$props) sizes = $$props.sizes;
    		if ("hue" in $$props) $$invalidate(6, hue = $$props.hue);
    		if ("color" in $$props) $$invalidate(1, color$1 = $$props.color);
    		if ("windowWidth" in $$props) $$invalidate(0, windowWidth = $$props.windowWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	color$1.rotate(hue);
    	return [windowWidth, color$1, resize];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { windowWidth: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get windowWidth() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set windowWidth(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		width: 300,
    		height: 400,
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
