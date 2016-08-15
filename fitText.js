(function ( $ ) {
    /**
     * Fit text according to given parent element height by calculating required font size
     * @param parentElementSelector it will use jQuery .parents(selector) method to determine parent element, default is element parent
     * @param options minFontSize, maxFontSize
     * @returns {*}
     */
    $.fn.fitTextByHeight = function ( parentElementSelector, options ) {
        var parentElement = jQuery( this ).parents( parentElementSelector );
        if ( 0 === parentElement.length ) {
            parentElement = $( this ).parent();
        }
        var parentSelector = parentElementSelector;
        var settings = $.extend( {
            'minFontSize': Number.NEGATIVE_INFINITY,
            'maxFontSize': Number.POSITIVE_INFINITY
        }, options );

        var getMaxHeight = function ( that ) {
            $that = jQuery( that );
            var maxHeight = jQuery( parentElement ).height();
            if ( 0 === maxHeight ) {
                maxHeight = that.height();
            }
            var siblingsHeight = 0;
            $that.siblings().each( function () {
                siblingsHeight += jQuery(this).outerHeight( true );
            } );
            // Add parent element paddings
            var tempParentElement = $that.parent();
            var counter_flag = 0;
            while ( tempParentElement.get( 0 ) !== parentElement.get( 0 ) ) {
                counter_flag++;
                siblingsHeight += tempParentElement.outerHeight( true ) - tempParentElement.height();
                tempParentElement.siblings().each( function () {
                    if ( jQuery( this ).height() === maxHeight || jQuery( this ).hasClass( 'brick-image' ) ) {
                        return true;
                    }
                    siblingsHeight += jQuery(this).outerHeight( true );
                } );
                tempParentElement = tempParentElement.parent();
                if ( counter_flag > 20 ) {
                    break;
                }
            }
            $that.show();
            maxHeight = maxHeight - siblingsHeight;
            maxHeight = maxHeight - ($that.outerHeight( true ) - $that.height());

            return maxHeight;
        }

        return this.each( function () {

            // Store the object
            var $this = $( this );

            if( true === $this.data('fitTextByHeight') ){
                return ;
            }
            //to avoid multiple assignment
            $this.data( 'fitTextByHeight', true );

            var resizer = function () {
                $this.hide();
                var maxHeight = getMaxHeight( $this );
                $this.show();
                var size = Math.max( Math.min( $this.width(), parseFloat( settings.maxFontSize ) ), parseFloat( settings.minFontSize ) );
                $this.css( 'font-size', size );
                var counter_flag = 0;
                while (  size > settings.minFontSize && ( $this.height() > maxHeight || $this.innerWidth() < $this.get(0).scrollWidth ) ) {
                    var ratio = $this.height() / size;
                    var lines = Math.ceil( ratio );
                    var diff = $this.height() - maxHeight;
                    if ( diff < 0 ) {
                        diff = $this.get( 0 ).scrollWidth - $this.innerWidth();
                        if ( diff < 5 ) {
                            return false;
                        } else {
                            diff = diff * 0.3;
                        }

                    }
                    size = size - ( diff / ( lines * 1.5 ) );
                    size = Math.min( size, parseFloat( settings.maxFontSize ) )
                    size = Math.max( size, parseFloat( settings.minFontSize ) );
                    $this.css( 'font-size', size );
                    maxHeight = getMaxHeight( $this );
                    // flag to avoid infinite loop
                    counter_flag++;
                    if ( counter_flag > 50 ) {
                        break;
                    }

                }

            };

            // Call once to set.
            resizer();

            //one parent element loaded - if is there any large image in container
            jQuery( parentElement ).load( resizer );

            //trigger when window loaded successfully, mainly required for container with images
            $( window ).load( resizer );
            $( parentElement ).find( 'img' ).on( 'load', resizer );

            // Call on resize. Opera debounces their resize by default.
            $( window ).on( 'resize.fittextbyheight orientationchange.fittextbyheight', resizer );

        } );
    };

    /**
     * Fit text according to given parent element width by calculating required font size
     * @param options minFontSize, maxFontSize
     * @returns {*}
     */
    $.fn.fitTextByWidth = function( options ) {
        var settings = $.extend( {
            'minFontSize': Number.NEGATIVE_INFINITY,
            'maxFontSize': Number.POSITIVE_INFINITY
        }, options );

        return this.each( function() {
            var $this = $( this );
            if( true === $this.data('fitTextByWidth') ){
                return ;
            }
            $this.data( 'fitTextByWidth', true );

            var resizer = function () {
                $.when( $( $this ).trigger( 'beforeResizeFitTextByHeight', $this ) ).done(function(){
                    var size = Math.max( Math.min( $this.width(), parseFloat( settings.maxFontSize ) ), parseFloat( settings.minFontSize ) );

                    $this.css( 'font-size', size );

                    var ratio = $this.height() / size;
                    var lines = parseInt( ratio )
                    if ( lines > 1 ) {
                        var compressor = ratio - lines;
                        compressor = ( (0.5 >= compressor && lines > 5 ) ? 0.75 : compressor );
                        compressor = (0 === compressor) ? 1 : compressor;
                        compressor = ( lines * compressor );

                        if ( compressor <= 2 ) {
                            compressor = lines;
                        }

                        size = Math.min( size, (settings.maxFontSize / compressor ) * ( 1.3 + ratio - lines ) );
                        size = Math.max( size, parseFloat( settings.minFontSize ) );
                        $this.css( 'font-size', size );
                    }
                    $( $this ).trigger( 'afterResizeFitTextByHeight', $this );
                });
            };

            // Call once to set.
            resizer();

            // Call on resize. Opera debounces their resize by default.
            $( window ).on( 'resize.fitTextByWidth orientationchange.fitTextByWidth', resizer );

        });
    };

})( jQuery );
