/*! jQuery UI integration for DataTables' Editor
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net-jqui', 'datatables.net-editor'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net-jqui')(root, $);
			}

			if ( ! $.fn.dataTable.Editor ) {
				require('datatables.net-editor')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



var doingClose = false;

/*
 * Set the default display controller to be our foundation control 
 */
DataTable.Editor.defaults.display = "jqueryui";

/*
 * Change the default classes from Editor to be classes for Bootstrap
 */
var buttonClass = "btn ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only";
$.extend( true, DataTable.Editor.classes, {
	form: {
		button:  buttonClass,
		buttonInternal:  buttonClass,
		buttonSubmit: buttonClass
	}
} );

var dialouge;

/*
 * jQuery UI display controller - this is effectively a proxy to the jQuery UI
 * modal control.
 */
DataTable.Editor.display.jqueryui = $.extend( true, {}, DataTable.Editor.models.displayController, {
	init: function () {
		if (! dialouge) {
			dialouge = $('<div class="DTED"></div>')
				.css('display', 'none')
				.appendTo('body')
				.dialog( $.extend( true, DataTable.Editor.display.jqueryui.modalOptions, {
					autoOpen: false,
					buttons: { "A": function () {} }, // fake button so the button container is created
					closeOnEscape: false // allow editor's escape function to run
				} ) );
		}

		return DataTable.Editor.display.jqueryui;
	},

	open: function ( dte, append, callback ) {
		dialouge
			.children()
			.detach();

		dialouge
			.append( append )
			.dialog( 'open' );

		$(dte.dom.formError).appendTo(
			dialouge.parent().find('div.ui-dialog-buttonpane')
		);

		dialouge.parent().find('.ui-dialog-title').html( dte.dom.header.innerHTML );
		dialouge.parent().addClass('DTED');

		// Modify the Editor buttons to be jQuery UI suitable
		var buttons = $(dte.dom.buttons)
			.children()
			.addClass( 'ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only' )
			.each( function () {
				$(this).wrapInner( '<span class="ui-button-text"></span>' );
			} );

		// Move the buttons into the jQuery UI button set
		dialouge.parent().find('div.ui-dialog-buttonset')
			.children()
			.detach();

		dialouge.parent().find('div.ui-dialog-buttonset')
			.append( buttons.parent() );

		dialouge
			.parent()
			.find('button.ui-dialog-titlebar-close')
			.off('click')
			.on('click', function () {
				if ( ! doingClose ) {
					dte.close('icon');
				}
			});

		// Need to know when the dialogue is closed using its own trigger
		// so we can reset the form
		$(dialouge)
			.off( 'dialogclose.dte-ju' )
			.on( 'dialogclose.dte-ju', function () {
				if ( ! doingClose ) {
					dte.close();
				}
			} );

		if ( callback ) {
			callback();
		}
	},

	close: function ( dte, callback ) {
		if ( dialouge ) {
			// Don't want to trigger a close() call from dialogclose!
			doingClose = true;
			dialouge.dialog( 'close' );
			doingClose = false;
		}

		if ( callback ) {
			callback();
		}
	},

	node: function () {
		return dialouge.parent()[0];
	},

	// jQuery UI dialogues perform their own focus capture
	captureFocus: false
} );


DataTable.Editor.display.jqueryui.modalOptions = {
	width: 600,
	modal: true
};


return DataTable.Editor;
}));
