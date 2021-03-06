var DuplicateVisView = require('../../../../../javascripts/cartodb/new_common/dialogs/duplicate_vis_view');
var cdb = require('cartodb.js');

describe('new_common/dialogs/duplicate_vis_view', function() {
  describe('when given a map', function() {
    beforeEach(function() {
      this.vis = new cdb.admin.Visualization({
        type: 'derived',
        name: 'my name'
      });
      this.user = new cdb.admin.User({
        username: 'pepe'
      });
      spyOn(this.vis, 'copy');
      this.table = this.vis.tableMetadata();

      this.view = new DuplicateVisView({
        model: this.vis,
        table: this.table,
        user: this.user
      });

      this.view.render();
    });

    it('should start the duplication process right away', function() {
      expect(this.vis.copy).toHaveBeenCalled();
    });

    it('should the name of the duplicate vis should be suffixed with copy', function() {
      expect(this.vis.copy.calls.argsFor(0)[0].name).toEqual('my name copy');
    });

    it('should render the loading initially', function() {
      expect(this.innerHTML()).toContain('Duplicating your');
    });

    describe('when duplication successfully finished', function() {
      beforeEach(function() {
        this.newVis = new cdb.admin.Visualization({});
        this.url = new cdb.common.MapUrl({ base_url: 'http://cartodb.com/user/pepe/viz/abc-123' });
        spyOn(this.newVis, 'viewUrl').and.returnValue(this.url);
        spyOn(this.view, '_redirectTo');
        this.vis.copy.calls.argsFor(0)[1].success(this.newVis);
      });

      it('should redirect to the edit url', function() {
        expect(this.view._redirectTo).toHaveBeenCalledWith(this.url.edit().toString());
        expect(this.newVis.viewUrl).toHaveBeenCalledWith(this.user);
      });
    });

    describe('when duplication fails with a general error', function() {
      beforeEach(function() {
        this.vis.copy.calls.argsFor(0)[1].error();
      });

      it('should render a fail template', function() {
        expect(this.innerHTML()).toContain('Sorry, something went wrong');
      });
    });

    describe('when duplication fails from import error', function() {
      beforeEach(function() {
        var importModel = new cdb.admin.Import({
          item_queue_id: 'abc-123',
          error_code: 8003,
          get_error_text: {
            title: 'Error creating table from SQL query',
            what_about: 'We could not create table from your query.'
          }
        });
        this.vis.copy.calls.argsFor(0)[1].error(importModel);
      });

      it('should render a the more detailed fail template', function() {
        expect(this.innerHTML()).toContain('Error creating table');
        expect(this.innerHTML()).toContain('We could not create table from your query');
        expect(this.innerHTML()).toContain('Persisting error?');
      });
    });
  });

  describe('when given a dataset', function() {
    beforeEach(function() {
      this.vis = new cdb.admin.Visualization({
        type: 'table',
        name: 'my name'
      });
      this.table = this.vis.tableMetadata();
      this.user = jasmine.createSpy('cdb.admin.User');

      spyOn(this.table, 'duplicate');
      spyOn(this.vis, 'isVisualization');

      this.view = new DuplicateVisView({
        model: this.vis,
        table: this.vis.tableMetadata(),
        user: this.user
      });
      this.view.render();
    });

    it('should start the duplication process right away with creating an import', function() {
      expect(this.table.duplicate).toHaveBeenCalled();
      expect(this.table.duplicate.calls.argsFor(0)[0]).toEqual('my name copy');
    });

    describe('when duplication finishes successfully', function() {
      beforeEach(function() {
        var newTable = jasmine.createSpyObj('table', ['viewUrl']);
        newTable.viewUrl.and.returnValue('http://cartodb.com/user/pepe/table/my_table_copy');
        spyOn(this.view, '_redirectTo');
        this.table.duplicate.calls.argsFor(0)[1].success(newTable);
      });

      it("should redirect to the new table's edit page", function() {
        expect(this.view._redirectTo).toHaveBeenCalledWith('http://cartodb.com/user/pepe/table/my_table_copy');
      });
    });

    describe('when duplicates fails', function() {
      beforeEach(function() {
        this.table.duplicate.calls.argsFor(0)[1].error();
      });

      it('should render the fail view', function() {
        expect(this.innerHTML()).toContain('Sorry, something went wrong');
      });
    });
  });
});
