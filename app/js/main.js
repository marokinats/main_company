//Burger-menu
$('.burger-menu__close').on('click', function(e) {
		e.preventDefault();

		var $this = $(this);

		$this.toggleClass('burger-menu__close_change');
		
		if($this.next().hasClass('hidden')) {
			$this.next().removeClass('hidden');
			$this.next().find('.burger-menu__open-left').stop().animate({
				'right': '50%'
			}, 500);
			$this.next().find('.burger-menu__open-right').stop().animate({
				'left': '50%'
			}, 500, function() {
				$(this).siblings('.burger-menu__open-text').stop().animate({
					'opacity': '1'
				}, 200)
			});
		} else {
			$this.next().find('.burger-menu__open-text').stop().animate({
				'opacity': '0'
			}, 200, function() {
				$(this).siblings('.burger-menu__open-left').stop().animate({
					'right': '100%'
				}, 500);
				$(this).siblings('.burger-menu__open-right').stop().animate({
					'left': '100%'
				}, 500, function() {
					$this.next().addClass('hidden');
				});
			})
		}
})