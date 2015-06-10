/**
 *
 */

angular
    .module('ui-select-infinity', [])
    .directive('reach-infinity', function($parse, $timeout) {
        function height(elem) {
            elem = elem[0] || elem;
            if (isNaN(elem.offsetHeight)) {
                return elem.document.documentElement.clientHeight;
            } else {
                return elem.offsetHeight;
            }
        }

        function offsetTop(elem) {
            if (!elem[0].getBoundingClientRect || elem.css('none')) {
                return;
            }
            return elem[0].getBoundingClientRect().top + pageYOffset(elem);
        }

        function pageYOffset(elem) {
            elem = elem[0] || elem;
            if (isNaN(window.pageYOffset)) {
                return elem.document.documentElement.scrollTop;
            } else {
                return elem.ownerDocument.defaultView.pageYOffset;
            }
        }

        /**
         * Since scroll events can fire at a high rate, the event handler
         * shouldn't execute computationally expensive operations such as DOM modifications.
         * based on https://developer.mozilla.org/en-US/docs/Web/Events/scroll#requestAnimationFrame_.2B_customEvent
         *
         * @param type
         * @param name
         * @param (obj)
         * @returns {Function}
         */
        function throttle(type, name, obj) {
            var obj = obj || window;
            var running = false;
            var func = function() {
                if (running) { return; }
                running = true;
                requestAnimationFrame(function() {
                    obj.dispatchEvent(new CustomEvent(name));
                    running = false;
                });
            };

            obj.addEventListener(type, func);

            return function() {
                obj.removeEventListener(type, func);
            };
        }

        return {
            link: function(scope, elem, attrs) {
                var container = elem,
                    scrollDistance = 0.3,
                    removeThrottle;

                console.log('infinityScroll', attrs['infinityScroll']);

                function tryToSetupInfinityScroll() {
                    var rows = angular.element('.ui-select-choices-row');

                    if (rows.length === 0) {
                        setupLater();
                        return false;
                    }

                    container = angular.element(document.querySelector('.ui-select-choices'));
                    elem = angular.element(rows[rows.length - 1]);
                    var handler = function() {
                        var containerBottom = height(container),
                            containerTopOffset = 0,
                            elementBottom;

                        if (offsetTop(container) !== void 0) {
                            containerTopOffset = offsetTop(container);
                        }

                        elementBottom = offsetTop(elem) - containerTopOffset + height(elem);
                        console.log('elementBottom', elementBottom);
                        console.log('containerBottom', containerBottom);

                        //if (useDocumentBottom) {
                        //    elementBottom = height((elem[0].ownerDocument || elem[0].document).documentElement);
                        //}

                        var remaining = elementBottom - containerBottom,
                            shouldScroll = remaining <= height(container) * scrollDistance + 1;

                        console.log('remaining', remaining);
                        console.log('shouldScroll', shouldScroll);

                        if (shouldScroll) {
                            var result = $parse(attrs['infinityScroll'])(scope);
                            console.log('result', result);
                        }
                    };

                    removeThrottle = throttle('scroll', 'optimizedScroll', container[0]);
                    container.on('optimizedScroll', handler);

                    scope.$on('$destroy', function() {
                        removeThrottle();
                        container.off('optimizedScroll', handler);
                    });

                    return true;
                }

                function setupLater() {
                    $timeout(tryToSetupInfinityScroll, 2000);
                }

                setupLater();
            }
        }
    });