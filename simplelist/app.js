;$(function () {
  // Mobile navigation select
  $(document).on('change', 'select[data-behaviour=links]', function () {
    document.location.href = $(this).val()
    return false;  
  })
      
  // Image slideshow (product page)
  if($('div[data-behaviour=cycle] img').length > 1) {
    $('.slideshow').addClass('many_pics'); // CSS hook
    $('div[data-behaviour=cycle]').cycle({
      fx:'fade', 
      timeout: 0, // do not cycle
      next: '.next',
      prev: '.prev'
    });
  }
  
  // Cart title toggles cart items, menu link on mobile
  $(document).on('click', 'a[data-behaviour=toggle]', function (evt) {
    var $target = $($(this).attr('href'))
    if($target.is(':visible'))
      $target.slideUp('fast')
    else
      $target.slideDown('fast')
    evt.preventDefault()
    return false; 
  })
})
