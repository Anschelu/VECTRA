const circles = document.querySelectorAll('.circle');

circles.forEach(circle => {
  circle.addEventListener('mouseenter', () => {
    anime({
      targets: circle,
      translateX: 100,
      scale: 1.2,
      duration: 500,
      easing: 'easeInOutQuad'
    });
  });

  circle.addEventListener('mouseleave', () => {
    anime({
      targets: circle,
      translateX: 0,
      scale: 1,
      duration: 500,
      easing: 'easeInOutQuad'
    });
  });
});


anime('star', {
    rotate: {
        scale: 3.2,
        duration: 400,
    }
  });

