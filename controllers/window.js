var args = $.args,
	timeout = null,
	$container = null,
	hasIcon = false;


// private interface
function ucfirst(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}


// public interface
exports.hide = function () {
	clearTimeout(timeout);

	$container.animate({

		transform: Ti.UI.create2DMatrix().translate(0, OS_ANDROID ? $container.height : -$container.height),
		duration: 200
	}, function () {
		if (args.view != null) {
			args.view.remove($container);
		}
		else {
			$container.close();
		}

		_.isFunction(args.onClose) && args.onClose();
	});
};

exports.setMessage = function (message) {
	$.caffeinaToastLabel.text = message;
};

exports.setIcon = function (icon) {
	if (icon == null) {

		hasIcon = false;
		$.resetClass($.caffeinaToastLabel, "caffeinaToastLabel caffeinaToastLabelWithoutIcon");
	}
	else {

		hasIcon = true;
		$.resetClass($.caffeinaToastLabel, "caffeinaToastLabel");
		$.caffeinaToastIcon.image = icon;
	}
};

exports.setStyle = function (style) {

	var tssStyle = ucfirst(style || "default");

	$.resetClass($.caffeinaToastView, "caffeinaToastView caffeinaToast".concat(tssStyle));

	$.resetClass($.caffeinaToastLabel, "caffeinaToastLabel ".concat((hasIcon ? "" : "caffeinaToastLabelWithoutIcon "), "caffeinaToastLabel", tssStyle));
};


// initialization
(function constructor(args) {

	exports.setIcon(args.icon);

	args.message != null && exports.setMessage(args.message);

	args.style != null && exports.setStyle(args.style);


	if (args.view == null) {
		$container = Ti.UI.createWindow({
			backgroundColor: 'transparent',
			fullscreen: true
		});
	}
	else {
		$container = Ti.UI.createView({

			backgroundColor: 'transparent',
			zIndex: 216
		});
		args.view.add($container);
	}

	$container.addEventListener('touchstart', function (e) {
		exports.hide();

		_.isFunction(args.onClick) && args.onClick(e);

		return;
	});

	if (OS_IOS && args.usePhysicsEngine === true && Ti.UI.iOS.createAnimator != null) {

		var animator = Ti.UI.iOS.createAnimator({referenceView: $container}),
			collision = Ti.UI.iOS.createCollisionBehavior(),
			dy = Ti.UI.iOS.createDynamicItemBehavior({elasticity: args.elasticity}),
			pusher = Ti.UI.iOS.createPushBehavior({
				pushDirection: {
					x: 0,
					y: args.pushForce
				},
			});

		collision.addItem($.caffeinaToastView);
		dy.addItem($.caffeinaToastView);
		pusher.addItem($.caffeinaToastView);

		animator.addBehavior(collision);
		animator.addBehavior(dy);
		animator.addBehavior(pusher);

		$container.applyProperties({
			height: 150,
			top: -86
		});
		$container.add($.caffeinaToastView);

		if (_.isFunction($container.open)) {
			$container.addEventListener('open', function () {
				animator.startAnimator();
			});
			$container.open();
		}
		else {
			animator.startAnimator();
		}
	}
	else {

		OS_IOS && $container.applyProperties({

			height: 65,
			top: -65
		});

		OS_ANDROID && $container.applyProperties({

			height: 65,
			bottom: -65
		});

		$container.add($.caffeinaToastView);

		if (_.isFunction($container.open)) {
			$container.addEventListener('open', function () {

				if (OS_ANDROID) {

					$container.animate({

						bottom: 0,
						duration: args.animationDuration
					});
				}
				else {

					$container.animate({

						top: 0,
						duration: args.animationDuration
					});
				}
			});

			$container.open();
		}
		else {

			if (OS_ANDROID) {

				$container.animate({

					bottom: 0,
					duration: args.animationDuration
				});
			}
			else {

				$container.animate({

					top: 0,
					duration: args.animationDuration
				});
			}
		}
	}


// Set the timer to automatically close the Window
	if (args.duration != null) {
		timeout = setTimeout(exports.hide, args.duration);
	}

})(args);
