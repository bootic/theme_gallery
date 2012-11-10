///////////////////////////////////////////////////////
// Snap Theme JS logic - (c) Bootic.net
// Written by Tomas Pollak
// Free for use to any online shop running on Bootic
///////////////////////////////////////////////////////

var gallery_height = 347;

$(document).ready(function(){

	var slideshow_selector = '#slideshow ul';
	if ($(slideshow_selector)[0])
		Snap.triggerSlideshow(slideshow_selector);

	var ticker_selector = '.ticker';
	if ($(ticker_selector)[0])
		Snap.triggerTicker(ticker_selector);

	var small_images_selector = "#image-list";
	var main_image_selector = '#main-image a';
	if($(small_images_selector)[0])
		Snap.triggerProductImageGallery(small_images_selector, main_image_selector);
	else if(Snap.isOldIE())
		Snap.centerVertically(main_image_selector);

	var overlay_selector = "a[rel^='overlay']";
	if($(overlay_selector)[0])
		Snap.enableOverlayedImages(overlay_selector);

	if($('.post')[0])
		Snap.relativizeTimes('.post .date');

	Snap.updateCart();

	$(document).on('cart_loaded', function(data){

		if(window.location.search.indexOf('active_promotion=true') != -1){
			Snap.showActivePromotion(data.promotion);
		}

	})


});

// image preloader function
//$.fn.preload = function() {
//	this.each(function(){
//		console.log(this);
//		$('<img/>')[0].src = this;
//	});
//}

var Snap = {

	isOldIE: function(){
		if (navigator.userAgent.indexOf('MSIE') == -1) return false;
		var version = parseFloat(navigator.appVersion.split("MSIE")[1]);
		return (version < 8);
	},

	loadImage: function(img, callback){

		imgPreloader = new Image();

		imgPreloader.onerror = function(e) {
			// console.log("Couldn't load image");
		};

		imgPreloader.onload = function() {
			imgPreloader.onerror = imgPreloader.onload = null;
			if(callback) callback(img);
		};

		var src = (typeof img == 'string') ? img : $(img).attr('src')
		imgPreloader.src = src;

	},

	showActivePromotion: function(promotion){

		if(!promotion) return;

		var amount = promotion.discount_type == '%' ?
			promotion.discount + '%' : '$' + promotion.discount;

		$('#promotion-amount').html(amount);
		$('#promotion-name').html(promotion.name);
		this.showOverlay('#promotion-active');

	},

	showOverlay: function(element){

		if(!$('#black-overlay')[0]){
			var overlay_div = '<div id="black-overlay"></div>';
			$('body').append(overlay_div);
		}

		var close_button = '<div class="close"><button onclick="return Snap.hideOverlay()">Close</button></div>';
		$(element).addClass('overlay-content').append(close_button).show();
		$('#black-overlay').fadeIn();

	},

	hideOverlay: function(){
		$('#black-overlay, .overlay-content').fadeOut();
	},

	centerVertically: function(img){
		var height = arguments[1] || $(img).parent().height();
		var h = $(img).attr('height');
		if(h == 0) return;
		var margin = (height - h) / 2;
		$(img).css({ marginTop: margin }).addClass('vert-centered');
	},

	triggerSlideshow: function(target){

		var loaded = false;
		$(target).find('img, span').addClass('hidden');

		this.loadImage($(target).find('img:first'), function(){

			$(target).cycle({
				fx:      'scrollHorz',
				prev:    '.prev-slide',
				next:    '.next-slide',
				easing:  'easeInOutExpo',
				height:  gallery_height + 'px',
				pause:   true, // pause on hover
				timeout: 4000, // 0 for non-auto
				speed:   1000,
				before: function(curr,next,opts) {

					var img = $(next).find('img');
					if((img).hasClass('vert-centered')) return;

					Snap.centerVertically(img, gallery_height);

					if(!loaded) {
						$(next).find('img, span').fadeIn();
						loaded = true;
					} else {
						$(next).find('img, span').removeClass('hidden');
					}
				}
			});

		});

	},

	triggerTicker: function(target){
		$(target).newsticker(5000);
	},

	enableOverlayedImages: function(target){

		$(target).fancybox({
			'zoomOpacity'		: true,
/*		'overlayShow'		: false,*/
			'zoomSpeedIn'		: 500,
			'zoomSpeedOut'	: 500,
			'easingIn'			: 'easeOutBack',
			'easingOut'			: 'easeInBack',
			'titlePosition'	: 'outside',
			'titleFormat'		: function(title, currentArray, currentIndex, currentOpts) {
				return '<span id="fancybox-title-over">Image ' +  (currentIndex + 1) + ' / ' + currentArray.length + ' ' + title + '</span>';
			}
		});

	},

	triggerProductImageGallery: function(small_image_container, main_image){

		// if there's more than four images, enable scrollable carousel
		if($(small_image_container).children().length > 4)
			Snap.enableImageScroller('#scroller', small_image_container);

		$(small_image_container + ' li').hover(function(e){

			var container = $(main_image);

			var large_img = $(this).find('img').attr('src').replace('medium', 'large');
			if(container.attr('href') == large_img) return false;

			var image_id = $(this).attr('id');
			var medium_img = large_img.replace('thumbnail', 'medium');

			container.attr('href', large_img).attr('id', image_id + '-display').find('img').fadeOut(300, function(){

				var img = this;
				var loading_div = '<div class="loading"></div>';
				container.append(loading_div);
				Snap.loadImage(medium_img, function(){

					$(img).attr('src', medium_img);
					if(Snap.isOldIE()) Snap.centerVertically(img, gallery_height);
					container.find('.loading').remove();
					$(img).fadeIn();

				});

			});

		});

		// we remove the rel attribute to prevent attaching fancybox's listener later
		$(main_image).attr('rel', '').click(function(){
			var image_id = $(this).attr('id').replace('-display', '');
			$('#' + image_id).find('a').trigger('click');
			return false;
		});

	},

	enableImageScroller: function(main_container, image_container){

		var animation_duration = 1500;

		$(main_container).mouseover(function(e){

			// Enable scroll function only when the height of the 'scroller' or menu is greater than the 'holder'.
			if($(this).height() < $(image_container).height()) {
				// Calculate the distance value from the 'holder' y pos and page Y pos.
				var distance = e.pageY - $(this).offset().top;
				// Get the percentage value with respect to the Mouse Y on the 'holder'.
				var percentage = distance / $(this).height();

				// if(percentage > 0.35 && percentage < 0.65) return; // dont move if cursor is in the middle (between A and B from top)

				// Calculate the new Y position of the 'slider'.
				var targetY = -Math.round(($(image_container).height() - $(this).height()) * percentage);

				// var offset = targetY - parseFloat($(image_container).css('top'));
				// if(offset < 0) offset = offset*-1;

				// With jQuery easing funtion from easing plugin.
				$(image_container).animate({top: [targetY+"px", "easeOutCirc"]}, { queue: false, duration: animation_duration });
			}

		});

	},

	updateCart: function(){
		$.getJSON('/cart', function(data){
			$(document).trigger('cart_loaded', data);
			if(data.units > 0) {
				var str = data.units + " productos - <strong>" + data.formatted_total + "</strong>";
				$('#cart-preview a').fadeOut(function(){
					$(this).html(str).fadeIn();
				})
			}
		});
	},

	relativizeTimes: function(selector){

		$(selector).each(function(e){
			var original_time = $(this).attr('title');
			var relative_time = Snap.relativeTime(original_time);
			$(this).find('span').html(relative_time);
		});

	},

	relativeTime: function(time_value) {
		var values = time_value.split(" ");

		var parsed_date = Date.parse(time_value);
		var now = new Date();

		var delta = parseInt((now - parsed_date) / 1000);
		delta = delta + (now.getTimezoneOffset() * 60);

		var str = 'hace ';

		if (delta < 60) {
			return str + 'menos de un minuto';
		} else if(delta < 120) {
			return str + 'un minuto';
		} else if(delta < (60*60)) {
			return str + (parseInt(delta / 60)).toString() + ' minutos';
		} else if(delta < (120*60)) {
			return str + 'una hora';
		} else if(delta < (24*60*60)) {
			return str + (parseInt(delta / 3600)).toString() + ' minutos';
		} else if(delta < (48*60*60)) {
			return str + 'un d&iacute;a';
		} else {
			return str + (parseInt(delta / 86400)).toString() + ' d&iacute;as';
		}

	}

}
