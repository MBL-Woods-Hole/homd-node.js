/**
 * Tooltip.js is a lightweight javascript plugin for responsive and
 * easy to use tooltips. Requires jQuery for the moment.
 *
 * @version   1.0
 * @author    Jakob Ploens <jakob@2helden.com>
 * @copyright Jakob Ploens 2016
 * @license   The MIT License
 */

var Tooltip = function(element, settings){

    var self = this;

    /**
     * Define default settings we go for.
     *
     * @param integer Animation's speed – if needed.
     * @param integer Delay between mouse leaving target and removing tooltip
     * @param integer Difference between tooltip and cursor
     *
     * @param string  CSS class for tooltip
     * @param string  CSS class for fixed tooltip
     * @param string  CSS class for left aligned tooltip
     * @param string  CSS class for right aligned tooltip
     * @param string  CSS class for top aligned tooltip
     * @param string  CSS class for bottom aligned tooltip
     * @param string  CSS class for shown tooltip
     *
     * @param string  Tooltip's position. Can be either auto or left/right/top/bottom
     * @param string  Data attribute for the content
     * @param string  Event to trigger the tooltip. If false, tooltip has to be triggered manually by calling tooltip.construct();
     * @param string  Event to trigger the remove of the tooltip.
     *
     * @param boolean If true, adds fixed class, no matter what inFixedPosition() returns
     * @param boolean If true, follows mouse instead of one defined position
     * @param boolean If true, injects html insted of plain text
     */
    this.defaults = {
        speed:       100,
        delay:       0,
        offset:      5,

        class:       'tooltip',
        classFixed:  'tooltip--fixed',
        classLeft:   'tooltip--left',
        classRight:  'tooltip--right',
        classTop:    'tooltip--top',
        classBottom: 'tooltip--bottom',
        classShown:  'tooltip--is-shown',

        position:    'auto',
        dataAttr:    'tooltip',
        trigger:     'mouseenter',
        triggerOff:  'mouseleave',

        fixed:       false,
        follow:      false,
        html:        false,
    };

    /**
     * Get options.
     * Settings is the combination of defaults and custom JS options,
     * Options has additionally the data-attributes included
     */
    this.settings = merge(this.defaults, settings);
    this.options  = this.settings;

    /**
     * Setup local store variables
     */
    this.bound = false;

    /**
     * Save target as object
     */
    this.target  = element;
    this.content = this.target.getAttribute('data-' + this.options.dataAttr);

    /**
     * Add tooltip and attributes
     */
    this.tooltip = document.createElement('div');
    this.tooltip.addClass(this.options.class);
    this.tooltip.setAttribute('role', 'tooltip');

    /**
     * Look for data-attributes at target and append if neccessary.
     */
    for(var key in this.defaults){
        var data = this.target.getAttribute('data-' + key);
        if(data && data != ""){
            if(data === "false"){
                data = false;
            } else if(data === "true"){
                data = true;
            }
            this.options[key] = data;
        }
    }



    /**
     * Init function which builds our tooltip
     *
     * @return prototype
     */
    this.init = function(){
        /**
         * Bind events to tooltip's event trigger
         */
        if(self.options.trigger){
            self.target.addEventListener(self.options.trigger, self.construct);
        }

        /**
         * Return this
         */
        return self;
    };


    /**
     * Construct the tooltip
     */
    this.construct = function(){

        /**
         * If no content is given on this element, do nothing.
         */
        if(!self.content || self.content === ''){
            return;
        }

        /**
         * Add content and append object to body
         */
        if(self.options.html){
            self.tooltip.innerHTML = self.content;
        } else {
            self.tooltip.textContent = self.content;
        }
        document.body.appendChild(self.tooltip);

        /**
         * If target is in a fixed container, apply fixed class to tooltip.
         */ 
        if(self.inFixedPosition(self.$target)){
            self.tooltip.addClass(self.options.classFixed);
        }

        /**
         * Place tooltip at dedicated position.
         */
        self.position();

        /**
         * If trigger off was not bound yet, bind it and set bound to true.
         */
        if(!self.bound){
            self.target.addEventListener(self.options.triggerOff, function(){
                setTimeout(self.remove, self.options.delay);
            });
            self.bound = true;
        }

        return self;
    };


    /**
     * Calculate tooltip at right position
     *
     * @return object left and top values as object
     */
    this.position = function(){

        /**
         * Get often used settings in easier and shorter variable names.
         */
        var position  = self.options.position;
        var offset    = self.options.offset * 2;
        var direction = 'down';

        /**
         * Get dimensions and position of target and tooltip
         */
        var windowWidth    = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

        var targetWidth    = self.target.offsetWidth;
        var targetHeight   = self.target.offsetHeight;

        var rect = self.target.getBoundingClientRect();
        var targetPosition = {
            top: rect.top + document.body.scrollTop,
            left: rect.left + document.body.scrollLeft
        };

        var tooltipWidth   = self.tooltip.offsetWidth;
        var tooltipHeight  = self.tooltip.offsetHeight;

        var left = targetPosition.left + (targetWidth / 2) - (tooltipWidth / 2);
        var top  = targetPosition.top - tooltipHeight - offset;

        /**
         * If window is smaller than tooltip, add a new max width to tooltip
         */
        if(windowWidth < (tooltipWidth * 1.5)){
            self.tooltip.style.maxWidth = (windowWidth / 2);
        }

        /**
         * Now we start checking for positions.
         */
        if(position === 'left' || left < 0){
            left = targetPosition.left + (targetWidth / 2) - offset;
            self.tooltip.addClass(self.options.classLeft);
        } else {
            self.tooltip.removeClass(self.options.classLeft);
        }

        if(position === 'right' || (left + tooltipWidth) > windowWidth){
            left = targetPosition.left - tooltipWidth + (targetWidth / 2) + offset;
            self.tooltip.addClass(self.options.classRight);
        } else {
            self.tooltip.removeClass(self.options.classRight);
        }

        if(position === 'bottom' || top < 0){
            direction = 'up';
            top = targetPosition.top + targetHeight + offset;
            self.tooltip.addClass(self.options.classBottom);
        } else {
            self.tooltip.removeClass(self.options.classBottom);
        }

        if(position === 'top'){
            top = targetPosition.top - tooltipHeight - offset;
            self.tooltip.removeClass(self.options.classBottom);
        }

        /**
         * If follow is true, recalculate the left and top values again.
         */
        if(self.options.follow){
            self.target.addEventListener('mousemove', function(event){
                left = event.pageX - (tooltipWidth / 2);
                top  = event.pageY - tooltipHeight - offset;

                self.tooltip.style.top  = parseInt(top) + 'px';
                self.tooltip.style.left = parseInt(left) + 'px';
                self.tooltip.addClass(self.options.classShown);
            });
        } else {
            self.tooltip.style.top  = parseInt(top) + 'px';
            self.tooltip.style.left = parseInt(left) + 'px';
            self.tooltip.addClass(self.options.classShown);
        }
    };


    /**
     * Returns true if one of parents is in fixed position
     *
     * @param  object
     * @return boolean
     */
    this.inFixedPosition = function(element){
        if(self.options.fixed) return true;

        return false;
    };


    /**
     * Remove a named tooltip or all.
     *
     * @param  boolean
     * @return boolean
     */
    this.remove = function(){
        var all = false;

        if(all){
            document.querySelector(self.options.class).removeClass(self.options.classShown);
            setTimeout(function(){
                document.querySelector(self.options.class).parentNode.removeChild(document.querySelector(self.options.class));
            }, self.speed);

        } else {
            self.tooltip.removeClass(self.options.classShown);
            setTimeout(function(){
                self.tooltip.parentNode.removeChild(self.tooltip);
            }, self.speed);
        }

        return;
    };


    /**
     * Destroy plugin and unbind events.
     */
    this.destroy = function(){
        self = null;
        delete self;
        return;
    };


    /**
     * Return init function
     */
    return this.init();
};


/**
 * Class to trigger more than one tooltip without using a loop manually.
 */
var Tooltips = function(selector, options){
    var self      = this;
    this.elements = document.querySelectorAll(selector);
    this.tooltips = [];
    this.options  = options;

    Array.prototype.forEach.call(self.elements, function(item, i){
        self.tooltips.push(new Tooltip(item, self.options));
    });

    return this;
};


/**
 * Short function to merge two objects.
 *
 * @param  object (gets overwritten)
 * @param  object (overwrites)
 * @return object (merged)
 */
function merge(objectA, objectB){
    var result = {};
    for(var attr in objectA){
        result[attr] = objectA[attr];
    }
    for(var attr in objectB){
        result[attr] = objectB[attr];
    }
    return result;
}

/**
 * addClass
 *
 * @param  string class name
 * @return object
 * @since  1.0
 */
Object.prototype.addClass = function(className){
    if(this.classList){
        this.classList.add(className);
    } else {
        this.className += ' ' + className;
    }
    return this;
};

/**
 * removeClass
 *
 * @param  string class name
 * @return object
 * @since  1.0
 */
Object.prototype.removeClass = function(className){
    if (this.classList){
        this.classList.remove(className);
    } else {
        this.className = this.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
};


/**
 * jQuery Plugin
 */
if(window.jQuery){
    (function($){
        'use strict';

        /**
         * Initialize jQuery plugin
         */
        $.fn.tooltip = function(options){
            $(this).each(function(){
                var tooltip = new Tooltip(this, options);
            });
            return;
        };
    })(jQuery);
}
