jQuery(function ($) {
	$.fn.extend({
		eReader: function (option) {
			option = $.extend({}, $.fn.eReader.defaults, option);

			var $this = $(this);

			var firstBlock;
			var lastBlock;
			var $firstBlock;
			var $lastBlock;

			var $firstSubBlock;
			var $lastSubBlock;

			var oldTop;
			var oldBottom;

			var textTop = 0; // start of viewing pane
			var textBottom = 0; // end of viewing pane
			var activeLine = 0;
			var nextActiveLine = 0;
			var turnDone = true;
			var totalElements; // number of elements

			var fullHeight;
			var wrapperHeight;

			var pageWidth;

			var $nextButton;
			var $prevButton;

			if ((navigator) && (navigator.appName == "Microsoft Internet Explorer")) {
				var version = -1
				var regexp = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");

				if (regexp.exec(navigator.userAgent) != null) {
					version = parseFloat(RegExp.$1);
				}

				if (version < 9) {
					option.turnInterval = 0; //turn off animation for older IE, since it looks cheap
					option.hardcover = false;
				}
			}

			var paragraphStart = 0;

			var $nextChapter = $('.nextChapter');
			var $prevChapter = $('.prevChapter');

			this.setTurnContent = function () {
				setTurnContent();
			}

			var setTurnContent = function () {
				$this.css({
					'position': 'relative',
					'width': '100%',
					'display': 'block'
				});
				pageWidth = $this.width();

				if (option.slider) {
					addSlider(firstBlock);
				}
				
				if ($this.height() < 10000) {
					$this.height(50000);
				}
				
				var visibleArea = $this.height() + $(window).height() - $(document).outerHeight() - 10;
				
				$this.height(visibleArea).wrapInner('<div id="ereaderTextWrapper"><div class="innerWrapper"><div id="ereaderTextContent"></div></div></div>').append('<div id="secondPageWrapper"><div class="innerWrapper"><div id="secondPageContent"></div></div></div><div id="pageTurnWrapper"><div class="innerWrapper"><div id="pageTurnContent"></div></div></div><div id="duplicateTextWrapper" class="rightPage"><div class="innerWrapper"><div id="duplicateTextContent"></div></div></div>').wrapInner('<div id="readerWrapper" class="book"></div>');

				if (option.hardcover) {
					if (option.twoPageLayout) {
						$('#readerWrapper').addClass('bookFull twoPage');
					} else {
						$('#readerWrapper').addClass('bookRight onePage');
					}
				} else {
					if (option.twoPageLayout) {
						$('#readerWrapper').addClass('twoPage');
					} else {
						$('#readerWrapper').addClass('onePage');
					}
				}

				$('#readerWrapper').height($this.height() - parseFloat($this.css('padding-top')) - parseFloat($this.css('padding-bottom'))).width(pageWidth - parseFloat($('#readerWrapper').css('padding-left')) - parseFloat($('#readerWrapper').css('padding-right')) - parseFloat($('#readerWrapper').css('margin-left')) - parseFloat($('#readerWrapper').css('margin-right')) );




				pageWidth = $('#readerWrapper').width() - parseFloat($('#ereaderTextWrapper').css('padding-left')) - parseFloat($('#ereaderTextWrapper').css('padding-right'));
				
				if (option.hardcover) {
					if (option.twoPageLayout) {
						$('#ereaderTextWrapper').addClass('leftPage').width(pageWidth / 2.08);
						$('#secondPageWrapper').addClass('rightPage').width(pageWidth / 2.08);
						pageWidth = $('#ereaderTextWrapper').width();
					} else {
						$('#ereaderTextWrapper').addClass('rightPage').width(pageWidth / 1.04);
						pageWidth = $('#ereaderTextWrapper').width();
					}
				}

				wrapperHeight = $('#readerWrapper').height() - parseFloat($('#ereaderTextWrapper').css('padding-top')) - parseFloat($('#ereaderTextWrapper').css('padding-bottom'));

				$('#ereaderTextWrapper').height(wrapperHeight).width(pageWidth);
				$('#secondPageWrapper').height(wrapperHeight).width(pageWidth);
				$('#pageTurnWrapper').height(wrapperHeight).width(pageWidth);
				$('#duplicateTextWrapper').height(wrapperHeight);

				$('#pageTurnWrapper').css({
					'left': pageWidth + 'px',
					'height': wrapperHeight + 'px'
				});

				var contentWidth = $('.innerWrapper').width();

				$('#ereaderTextContent').width(contentWidth);
				$('#secondPageContent').html($('#ereaderTextContent').html()).width(contentWidth);
				$('#duplicateTextContent').html($('#ereaderTextContent').html()).width(contentWidth);
				$('#pageTurnContent').html($('#ereaderTextContent').html()).width(contentWidth);


				$this.prepend('<a class="arrow_tc" id="prevButton" href="#"></a>').append('<a class="arrow_tc" id="nextButton" href="#"></a>');

				$nextButton = $("#nextButton");
				$prevButton = $("#prevButton");

				$nextButton.click(function (event) {
					event.preventDefault();
					if (turnDone) {
						if (textBottom < fullHeight) {
							pageDown();
						}
					}
				})

				$prevButton.click(function (event) {
					event.preventDefault();
					if (turnDone) {
						if (textTop > 0) {
							pageUp();
						}
					}
				});
				
				$('.arrow_tc').css({
					'top': (wrapperHeight - $('.arrow_tc').height()) / 2 + 'px'
				});

				$('#ereaderTextContent').height('auto');
				fullHeight = $('#ereaderTextContent').height();  // height of the full text

			}

			this.setPageWidth = function () {
				setPageWidth();
			}

			var setPageWidth = function () {
				$('#readerWrapper').width($this.width() - parseFloat($this.css('padding-left')) - parseFloat($this.css('padding-right')) - parseFloat($this.css('margin-left')) - parseFloat($this.css('margin-right')) );

				pageWidth = $('#readerWrapper').width();

				if (option.hardcover) {
					$('#readerWrapper').width(pageWidth / 1.04);
					pageWidth = $('#readerWrapper').width();
				}

				$('#ereaderTextWrapper').height(wrapperHeight).width(pageWidth);
				$('#pageTurnWrapper').height(wrapperHeight).width(pageWidth);
				$('#duplicateTextWrapper').height(wrapperHeight);

				$('#pageTurnWrapper').css({
					'left': pageWidth + 'px'
				});

				$('#ereaderTextContent').width(pageWidth);
				$('#duplicateTextContent').html($('#ereaderTextContent').html()).width(pageWidth);
				$('#pageTurnContent').html($('#ereaderTextContent').html()).width(pageWidth);

				adjustScreen();
			}

			this.tagBlocks = function () {
				tagBlocks();
			}

			var tagBlocks = function () {
				totalElements = 0;
				
				$('#ereaderTextContent').find('*').each(function (i) {
					if ($(this).isTextBlock()) {
						$(this).addClass('ereaderBlockItem ereaderblock' + totalElements); //add sizer and marker to text blocks
						totalElements++;
					}
				});

				totalElements--;
			}

			this.getTop = function (block) {
				getTop(block);
			}

			var getTop = function (block) {
				var top = $('#ereaderTextContent .ereaderblock' + block).position().top;
				return top;
			}

			this.newTop = function (newTextTop, animation) {
				newTop(newTextTop, 0, animation);
			}

			this.activeLine = function () {
				return activeLine;
			}
			
			this.firstBlock = function () {
				return firstBlock;
			}

			var newTop = function (newTextTop, newActiveLine, animation) {
				$nextButton.show();
				$prevButton.show();
				$nextChapter.hide();
				$prevChapter.hide();
				$('#ereaderSlider').show();

				oldTop = textTop;
				oldBottom = textBottom;

				textTop = newTextTop;
				activeLine = newActiveLine; //set first line

				paragraphStart = activeLine * parseInt($firstBlock.css('line-height')) / $firstBlock.height(); //set paragraph start position for use in resizing

				var i = firstBlock;

				while ((i <= totalElements) && ($('#ereaderTextContent .ereaderblock' + i).position().top - textTop < wrapperHeight)) {
					lastBlock = i;
					i++;
				}

				$lastBlock = $('#ereaderTextContent .ereaderblock' + lastBlock);


				textBottom = $lastBlock.position().top;

				i = 0;

				nextActiveLine = 0; //reset nextActiveLine

				if (fullHeight - textTop <= wrapperHeight) {
					textBottom = fullHeight;
				} else if ($lastBlock.hasClass('figure')) {

				} else if ($lastBlock.parent().hasClass('figure')) {
					$lastBlock = $lastBlock.parent();
					var classes = $lastBlock.attr('class').split(" ");
					for (i = 0; i < classes.length; i++) {
						if (classes[i].indexOf("ereaderblock") >= 0) {
							lastBlock = parseInt(classes[i].replace("ereaderblock",""));
							break;
						}
					}


					textBottom = $lastBlock.position().top;

				} else if (($lastBlock.get(0).tagName.toLowerCase() != 'tr') && ($lastBlock.get(0).tagName.toLowerCase() != 'img') && (!$lastBlock.isHeading())) {

					if ($lastBlock.height() <= parseFloat($lastBlock.css('line-height')) * 3) {
						textBottom += parseFloat($lastBlock.css('margin-top')) + parseFloat($lastBlock.css('padding-top')); //add margin space from last element
						while (textBottom + parseFloat($lastBlock.css('line-height')) - textTop <= wrapperHeight) {
							textBottom += parseFloat($lastBlock.css('line-height')); //if room for additional line, then add line
							nextActiveLine++;
						} //move text to fit all lines
					}
				}

				if ((textBottom < fullHeight) && (nextActiveLine == 0) && (lastBlock > 0) && ($('#ereaderTextContent .ereaderblock' + (lastBlock - 1)).isHeading())) {
					lastBlock--;
					textBottom = $('#ereaderTextContent .ereaderblock' + lastBlock).position().top;
					$lastBlock = $('#ereaderTextContent .ereaderblock' + lastBlock);
				}

				if (fullHeight <= wrapperHeight) {
					textTop = 0;
					fullHeight = wrapperHeight;
					textBottom = wrapperHeight;
					$('#ereaderSlider').hide();
				}

				if (textTop == 0) {
					$prevButton.hide();
					$prevChapter.show();
				}

				if (textBottom == fullHeight) {
					$nextButton.hide();
					$nextChapter.show();
				}

				if ((option.turnInterval) && (animation == "forward")) {
					flipForward();
				} else if ((option.turnInterval) && (animation == "backward")) {
					flipBackward();
				} else {
					$('#ereaderTextContent').css("margin-top", -textTop).height(textBottom);
					$('#pageTurnContent').css("margin-top", -textTop).height(textBottom);
					$('#duplicateTextContent').css("margin-top", -textTop).height(textBottom);
				}

				if (option.slider) {
					if (lastBlock == totalElements) {
						$("#ereaderSlider").slider("value", lastBlock);
					} else {
						$("#ereaderSlider").slider("value", firstBlock);
					}
				}

				$('#ctl00_ContentPlaceHolder1_ucBookPages_hdnParagraph').val(firstBlock);
				updatePageField();
			}

			this.newBottom = function (newTextBottom, animation) {
				newBottom(newTextBottom, animation);
			}

			var newBottom = function (newTextBottom, animation) {

				$nextButton.show();
				$prevButton.show();
				$('#ereaderSlider').show();

				$nextChapter.hide();
				$prevChapter.hide();

				textBottom = newTextBottom; //current bottom of viewing area becomes new top

				var i = lastBlock;
				while ((i >= 0) && (textBottom - $('#ereaderTextContent .ereaderblock' + i).position().top < wrapperHeight)) {
					firstBlock = i;
					i--;
				}

				$firstBlock = $('#ereaderTextContent .ereaderblock' + firstBlock);
				textTop = $firstBlock.position().top;

				activeLine = 0;
				paragraphStart = 0;

				textTop += parseInt($firstBlock.css('margin-top'));

				if ($firstBlock.hasClass('figure')) {

				} else if ($firstBlock.parent().hasClass('figure')) {
					$firstBlock = $firstBlock.parent().next();
					var classes = $firstBlock.attr('class').split(" ");
					for (i = 0; i < classes.length; i++) {
						if (classes[i].indexOf("ereaderblock") >= 0) {
							firstBlock = parseInt(classes[i].replace("ereaderblock",""));
							break;
						}
					}
					textTop = $firstBlock.position().top;
				} else if ((firstBlock > 0) && ($('#ereaderTextContent .ereaderblock' + (firstBlock - 1)).get(0).tagName.toLowerCase() != 'tr') && ($('#ereaderTextContent .ereaderblock' + (firstBlock - 1)).get(0).tagName.toLowerCase() != 'img')) {
					if (textBottom + parseInt($('#ereaderTextContent .ereaderblock' + (firstBlock - 1)).css('margin-top')) + parseInt($('#ereaderTextContent .ereaderblock' + (firstBlock - 1)).css('padding-top')) + parseInt($('#ereaderTextContent .ereaderblock' + (firstBlock - 1)).css('line-height')) - textTop < wrapperHeight) {
						firstBlock--;
						textTop = $('#ereaderTextContent .ereaderblock' + firstBlock).position().top + parseInt($firstBlock.css('margin-top')) + parseInt($firstBlock.css('padding-top'));
						$firstBlock = $('#ereaderTextContent .ereaderblock' + firstBlock);
	
						while (textBottom + parseInt($firstBlock.css('line-height')) - textTop >= wrapperHeight) {
							textTop += parseInt($firstBlock.css('line-height')); //if room for additional line, then add line
							activeLine++;
						} //move text to fit all lines
	
						paragraphStart = activeLine * parseInt($lastBlock.css('line-height')) / $lastBlock.height();
					}
				}

				if (fullHeight <= wrapperHeight) {
					textTop = 0;
					fullHeight = wrapperHeight;
					textBottom = wrapperHeight;
					$('#ereaderSlider').hide();
				}

				if (textTop == 0) {
					$prevButton.hide();
					$prevChapter.show();
				}

				if (textBottom == fullHeight) {
					$nextButton.hide();
					$nextChapter.show();
				}

				if ((option.turnInterval) && (animation == "forward")) {
					flipForward();
				} else if ((option.turnInterval) && (animation == "backward")) {
					flipBackward();
				} else {
					$('#ereaderTextContent').css("margin-top", -textTop).height(textBottom);
					$('#pageTurnContent').css("margin-top", -textTop).height(textBottom);
					$('#duplicateTextContent').css("margin-top", -textTop).height(textBottom);
				}


				if (option.slider) {
					if (lastBlock == totalElements) {
						$("#ereaderSlider").slider("value", lastBlock);
					} else {
						$("#ereaderSlider").slider("value", firstBlock);
					}
				}

				$('#ctl00_ContentPlaceHolder1_ucBookPages_hdnParagraph').val(firstBlock);
				updatePageField();
			}

			var updatePageField = function () {
				$('#ePageURL').val($('#ctl00_ContentPlaceHolder1_ucCitations_txtPageURL').val() + '&ParaNum=' + firstBlock);
			}

			this.adjustFontSize = function () {
				adjustFontSize();
			}

			var adjustFontSize = function (startPosition) {

				fitImages('top');
				adjustScreen();
			}

			this.adjustScreen = function () {
				adjustScreen();
			}

			var adjustScreen = function (startPosition) {

				$('#duplicateTextContent').html($('#ereaderTextContent').html());
				$('#pageTurnContent').html($('#ereaderTextContent').html());

				$('#ereaderTextContent').height('auto');
				fullHeight = $('#ereaderTextContent').height();  // height of the full text
				$('#ereaderTextContent').height(textBottom);

				var totalLines = 0;

				totalLines = Math.round(parseFloat($firstBlock.height()) / parseFloat($firstBlock.css('line-height')));

				textTop = $firstBlock.position().top;

				if (paragraphStart > 0) {
					textTop += parseFloat($firstBlock.css('margin-top')) + parseFloat ($firstBlock.css('padding-top')) + (Math.floor(paragraphStart * totalLines) * parseFloat($firstBlock.css('line-height')));
				}

				if (startPosition == 'bottom') {
					$('#ereaderTextContent').height('auto');
					textBottom = $('#ereaderTextContent').height();
					newBottom(textBottom, 'none');
				} else {
					newTop(textTop, activeLine, 'none');
				}
			}

			this.pageDown = function () {
				pageDown();
			}

			var pageDown = function () {
				$('#ereaderTextContent').height('auto');
				fullHeight = $('#ereaderTextContent').height();  // height of the full text

				$('#ereaderTextContent').height(textBottom);

				firstBlock = lastBlock;
				$firstBlock = $lastBlock;

				newTop(textBottom, nextActiveLine, "forward");
			}

			this.pageUp = function () {
				pageUp();
			}

			var pageUp = function () {

				$('#textWrapper').css({
					"width": 0
				});

				$('#ereaderTextContent').height('auto');
				fullHeight = $('#ereaderTextContent').height();
				$('#ereaderTextContent').height(textBottom);

				lastBlock = firstBlock;
				$lastBlock = $firstBlock;

				if (textTop < wrapperHeight) {
					firstBlock = 0;
					newTop(0, 0, "backward");
				} else {
					nextActiveLine = activeLine;
					newBottom(textTop, "backward");
				}

			}

			//initial position
			this.start = function () {
				start();
			}

			var start = function () {
				tagBlocks();

				firstBlock = option.firstBlock;
				lastBlock = totalElements; // start with total

				$firstBlock = $('#ereaderTextContent').find('.ereaderblock' + firstBlock);
				$lastBlock = $('#ereaderTextContent').find('.ereaderblock' + lastBlock);

				if (option.slider) {
					$("#ereaderSlider").slider({
						"max": totalElements
					});
				}

				newTop($firstBlock.position().top, 0, 'none');

				fitImages('top');

			}

			//initial position -- end of document
			this.startAtEnd = function () {
				startAtEnd();
			}

			var startAtEnd = function () {
				tagBlocks();

				firstBlock = 0;
				lastBlock = totalElements; // start with total

				$firstBlock = $('#ereaderTextContent').find('.ereaderblock' + firstBlock);
				$lastBlock = $('#ereaderTextContent').find('.ereaderblock' + lastBlock);

				if (option.slider) {
					$("#ereaderSlider").slider({
						"max": totalElements,
						"value": lastBlock
					});
				}

				textBottom = $('#ereaderTextContent').height();
				newBottom(textBottom, 'none');

				fitImages('bottom');

			}

			var addSlider = function (position) {
				$this.after('<div id="ereaderSlider"></div>');
				var sliderValue;
				$("#ereaderSlider").slider({
					min: 0,
					max: 1,
					value: position,
					step: 1,
					start: function (event, ui) {
						sliderValue = ui.value
					},
					stop: function (event, ui) {
						if (ui.value < sliderValue) {
							var animation = "backward";
						} else {
							var animation = "forward";
						}
						firstBlock = ui.value;
						console.log(firstBlock);
						newTop(getTop(ui.value), 0, animation)
					}
				}).width($('.book').width()).css({
					'padding-left': $('.book').css('padding-left'),
					'padding-right': $('.book').css('padding-right'),
					'margin-left': $('.book').css('margin-left'),
					'margin-right': $('.book').css('margin-right')
				});
			}

			var flipForward = function () {
				turnDone = false;
				$('#duplicateTextContent').css({
					"margin-top": -textTop
				}).height(textBottom);

				$('#ereaderTextWrapper').css({
					'width': pageWidth + "px"
				});

				$('#pageTurnWrapper').css({
					"width": 0,
					"left": pageWidth + "px",
					'-webkit-box-shadow': '30px 0px 0px 0px rgba(0, 0, 0, .25)',
					'-moz-box-shadow': '30px 0px 0px 0px rgba(0, 0, 0, .25)',
					'box-shadow': '30px 0px 0px 0px rgba(0, 0, 0, .25)'
				}).show().animate(
					{
						width: (pageWidth / 2) + 'px',
						left: '0px'
					},
					{
						duration: option.turnInterval,
						easing: "linear",
						step: function (now, fx) {
							$('#ereaderTextWrapper').css({
								"width": $('#pageTurnWrapper').css("left")
							});

							$('#duplicateTextWrapper').css({
								"width": pageWidth - parseFloat($('#pageTurnWrapper').css("left"))
							});

						},
						complete: function () {
							$('#ereaderTextWrapper').hide().css('width', '0px');
						}
					}
				).animate(
					{
						left: -pageWidth + 'px',
						width: pageWidth + 'px'
					},
					{
						duration: option.turnInterval / 2,
						easing: "linear",
						step: function (now, fx) {
							$('#pageTurnWrapper').css({
								'-webkit-box-shadow': ((pageWidth - now) / 10) + 'px 0px 0px 0px rgba(0, 0, 0, .25)',
								'-moz-box-shadow': ((pageWidth - now) / 10) + 'px 0px 0px 0px rgba(0, 0, 0, .25)',
								'box-shadow': ((pageWidth - now) / 10) + 'px 0px 0px 0px rgba(0, 0, 0, .25)'
							});
						},
						complete: function () {
							$('#pageTurnWrapper').hide();
							$('#pageTurnContent').css({
								"margin-top": -textTop
							}).height(textBottom);

							$('#ereaderTextContent').css({
								"margin-top": -textTop
							}).height(textBottom);

							$('#duplicateTextWrapper').css({
								"width": '0'
							});

							$('#ereaderTextWrapper').css({
								"width": pageWidth + 'px'
							}).show();
							turnDone = true;
						}
					}
				);
			}

			var flipBackward = function () {
				turnDone = false;

				$('#ereaderTextWrapper').css({
					"width": 0
				});

				$('#duplicateTextWrapper').css({
					"width": pageWidth + 'px'
				});

				$('#ereaderTextContent').css({
					"margin-top": -textTop
				}).height(textBottom);

				$('#pageTurnContent').css({
					"margin-top": -textTop
				}).height(textBottom);

				$('#pageTurnWrapper').css({
					"width": pageWidth + "px",
					"left": -pageWidth + "px",
					'-webkit-box-shadow': '0px 0px 0px 0px rgba(0, 0, 0, .25)',
					'-moz-box-shadow': '0px 0px 0px 0px rgba(0, 0, 0, .25)',
					'box-shadow': '0px 0px 0px 0px rgba(0, 0, 0, .25)'
				}).show().animate(
					{
						width: (pageWidth / 2) + 'px',
						left: '0px'
					},
					{
						duration: option.turnInterval,
						easing: "linear",
						step: function (now, fx) {
							$('#pageTurnWrapper').css({
								'-webkit-box-shadow': (now / 10) + 'px 0px 0px 0px rgba(0, 0, 0, .25)',
								'-moz-box-shadow': (now / 10) + 'px 0px 0px 0px rgba(0, 0, 0, .25)',
								'box-shadow': (now / 10) + 'px 0px 0px 0px rgba(0, 0, 0, .25)'
							});
						},
						complete: function () {
							$('#ereaderTextWrapper').css({
								"width": (pageWidth / 2) + "px"
							});
						}
					}
				).animate(
					{
						left: pageWidth + 'px',
						width: '0px'
					},
					{
						duration: option.turnInterval / 2,
						easing: "linear",
						step: function (now, fx) {
							$('#ereaderTextWrapper').css({
								"width": $('#pageTurnWrapper').css("left")
							});

							$('#duplicateTextWrapper').css({
								"width": pageWidth - parseFloat($('#pageTurnWrapper').css("left"))
							});

						},
						complete: function () {
							$('#pageTurnWrapper').hide();
							$('#duplicateTextContent').css({
								"margin-top": -textTop
							}).height(textBottom);
							turnDone = true;

							$('#duplicateTextWrapper').css({
								"width": '0'
							});

							$('#ereaderTextWrapper').css({
								"width": pageWidth + 'px'
							});

						}
					}
				);
			}

			var fitImages = function (startPosition) {
				$('#ereaderTextContent').find('img').each(function (i) {

					$(this).error(function () {
						$(this).attr('src', '/common/images/coming_soon.jpg').css({
							'height': '115px',
							'width': '85px'
						});
						adjustScreen();
					});

					if (!this.complete) {
						$(this).load(function () {
							$(this).fitImage(wrapperHeight, pageWidth);
							if (startPosition == 'top') {
								adjustScreen('top');
							} else {
								adjustScreen('bottom');
							}

						});
					} else {
						$(this).fitImage(wrapperHeight, pageWidth);
						if (startPosition == 'top') {
							adjustScreen('top');
						} else {
							adjustScreen('bottom');
						}
					}

				});

				return true;
			};

			setTurnContent();

			if (option.startAtEnd) {
				startAtEnd(); //start at the end of the document
			} else {
				start();
			}
			
			$('#readerWrapper').on("click", ".resizedPicture", function() {
				$('body').append('<div id="ereaderResizeWrapper"></div><div id="ereaderPageShadow"></div>');
				$(this).clone().appendTo('#ereaderResizeWrapper');
				$('#ereaderResizeWrapper img').fitImage($(window).height(), $(window).width());
				$('#ereaderResizeWrapper').width($('#ereaderResizeWrapper img').width()).height($('#ereaderResizeWrapper img').height()).css({
					'margin-top': (($(window).height() - $('#ereaderResizeWrapper').height()) / 2) + 'px',
					'margin-left': (($(window).width() - $('#ereaderResizeWrapper').width()) / 2) + 'px'
				});
			});
			
			$('body').on('click', '#ereaderResizeWrapper', function() {
				$('#ereaderResizeWrapper').remove();
				$('#ereaderPageShadow').remove();
			});

			$('body').on('click', '#ereaderPageShadow', function() {
				$('#ereaderResizeWrapper').remove();
				$('#ereaderPageShadow').remove();
			});


			return this;
		},

		isTextBlock: function () {
			var textBlocks = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'center', 'li', 'blockquote', 'dt', 'dd', 'div', 'tr', 'img'];
			if ($.inArray($(this).get(0).tagName.toLowerCase(), textBlocks) > -1) { //block is text based
				return true;
			} else {
				return false;
			}
		},

		isHeading: function () {
			var headingBlocks = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
			if ($.inArray($(this).get(0).tagName.toLowerCase(), headingBlocks) > -1) { //block is a heading
				return true;
			} else {
				return false;
			}
		},

		isImage: function () {
			var isImage = false;
			if ($(this).get(0).tagName.toLowerCase() == "img") {
				isImage = true;
			}

			return isImage;
		},

		fitImage: function (maxHeight, pageWidth) {

			maxHeight += 0 - parseFloat($(this).parent().css('padding-top')) - parseFloat($(this).parent().css('padding-bottom')) - parseFloat($(this).parent().css('margin-top')) - parseFloat($(this).parent().css('margin-bottom'));

			$(this).removeAttr('style').removeClass('resizedPicture').height('auto').width('auto');

			var imageHeight = $(this).height();
			var imageWidth = $(this).width();
			var ratio = 0;
			var changed = false;

			if ($(this).parent().hasClass('figure')) {
				maxHeight += $(this).height() - $(this).parent().outerHeight();
			}

			if (imageHeight > maxHeight) {
				ratio = maxHeight / imageHeight;
				$(this).height(imageHeight * ratio).width(imageWidth * ratio);

				imageHeight = $(this).height();
				imageWidth = $(this).width();

				changed = true;
			}

			if (imageWidth > pageWidth) {
				ratio = pageWidth / imageWidth;
				$(this).height(imageHeight * ratio).width(imageWidth * ratio);

				changed = true;
			}

			if (changed) {
				$(this).addClass('resizedPicture');
			}

			return true;
		}
	});


	$.fn.eReader.defaults = {
		firstBlock: 0, // block to start with - 0-based
		activeLine: 0, // start that block on the first line
		startAtEnd: false, //start from the back
		slider: true, // include slider at bottom
		turnInterval: 200, // time to turn page, in ms. set to 0 for no animation
		twoPageLayout: false, //show two pages
		hardcover: false // show book skeumorph
	};

});