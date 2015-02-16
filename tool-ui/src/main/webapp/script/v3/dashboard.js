define([
    'jquery',
    'bsp-utils'],

function($, bsp_utils) {

  bsp_utils.onDomInsert(document, '.dashboard-columns', {

    'insert': function(dashboard) {

      var defaults = {
        dragClass        : 'drag-active',
        placeholderClass : 'widget-ghost',
        throttleInterval : 100
      };

      var settings = $.extend({}, defaults, {state : {}});

      var $dashboard = $(dashboard);
      var $widgets = $dashboard.find('.dashboard-widget');

      $widgets.each(function() {
        $(this).attr('draggable', 'true');
      });

      $widgets.on('dragstart', dragStart);
      $widgets.on('dragend'  , dragEnd);
      $widgets.on('dragover' , bsp_utils.throttle(settings.throttleInterval, dragOver));
      $widgets.on('dragenter', bsp_utils.throttle(settings.throttleInterval, dragEnter));
      $widgets.on('dragleave', bsp_utils.throttle(settings.throttleInterval, dragLeave));
      //webkit bug not fixed, cannot use drop event v. 39.0.2171.99 https://bugs.webkit.org/show_bug.cgi?id=37012
      //$widgets.on('drop'     , drop);

      function dragStart(e) {
        console.log('START() -  begin');
        settings.state.activeWidget = this;

        toggleEditMode(e);

        var dataTransfer = e.originalEvent.dataTransfer;
        dataTransfer.setData('text/html', settings.state.activeWidget.innerHTML);
        dataTransfer.effectAllowed = 'move';
        dataTransfer.dropEffect = 'move';

        console.log('START() -  end');
      }

      function dragOver(e) {
        if (e.preventDefault) e.preventDefault();
        console.log('OVER() -  begin');

        var dataTransfer = e.originalEvent.dataTransfer;
        dataTransfer.effectAllowed = 'move';
        dataTransfer.dropEffect = 'move';
        console.log('OVER() -  end');

        return false;
      }

      function dragEnter(e) {
        console.log('ENTER() -  begin');
        e.preventDefault();

        if (this === settings.state.dragTarget || this === settings.state.placeholder || this === settings.state.activeWidget) {
          return;
        }

        settings.state.dragTarget = this;

        var $dragTarget = $(this);

        if ($dragTarget.hasClass(settings.dragClass) || $dragTarget.hasClass(settings.placeholderClass)) {
          console.log('LEAVE() - self found, exiting drag over');
          return;
        }

        var prev = $dragTarget.prev();

        if (prev) {

          if (typeof settings.state.placeholder === 'undefined') {
            settings.state.placeholder =  $('<div />', {'class' : 'widget ' + settings.placeholderClass});
          }

          if (!prev.hasClass(settings.placeholderClass)) {
            $dragTarget.before(settings.state.placeholder);
          }

        }

        console.log('ENTER() - end');
        return false;
      }

      function dragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("LEAVE() - begin");


        if (this === settings.state.dragTarget || this === settings.state.placeholder || this === settings.state.activeWidget) {
          return;
        }

        var $dropTarget = $(this);
        var prev = $dropTarget.prev();

        if (prev) {

          if (prev.hasClass(settings.placeholderClass)) {
            prev.detach();
          }

        }

        settings.state.dragTarget = null;

        console.log("LEAVE() - end");
      }

      //function drop(e) {
      //  if (e.stopPropagation) e.stopPropagation();
      //  console.log("DROP() - begin");
      //
      //  console.log("DROP() - end");
      //}

      function dragEnd(e) {
        console.log("END() - begin");
        toggleEditMode(e);

        if (!settings.state.dragTarget) {
          return;
        }

        $(settings.state.placeholder).replaceWith(settings.state.activeWidget);

        //e.originalEvent.dataTransfer.dropEffect = 'move';


        console.log('END() - end');
      }

      function toggleEditMode(e) {
        var $widget = $(e.target);
        $widget.toggleClass(settings.dragClass);
        //fixes chrome issue where drag end is fired when dom is manipulated in dragstart
        //https://code.google.com/p/chromium/issues/detail?id=168544
        setTimeout(function() { $dashboard.toggleClass(settings.dragClass); }, 2);
      }

    }

  });

});