var CreateDialogView = require('../../../../../../javascripts/cartodb/new_common/dialogs/create/create_view');
var CreateMapModel = require('../../../../../../javascripts/cartodb/new_common/dialogs/create/create_map_model');

describe('new_dashboard/dialogs/create/create_view', function() {
  beforeEach(function() {
    this.user = new cdb.admin.User({
      base_url: 'http://paco.cartodb.com',
      username: 'paco'
    });

    var createModel = new CreateMapModel({}, {
      user: this.user
    });

    this.view = new CreateDialogView({
      model: createModel,
      user: this.user,
      type: 'map',
      currentUserUrl: this.currentUserUrl
    });

    this.view.render();
  });

  it('should render correctly', function() {
    expect(this.view.$('.CreateDialog-header').length).toBe(1);
    expect(this.view.$('.CreateDialog-body').length).toBe(1);
    expect(this.view.$('.CreateDialog-footer').length).toBe(1);
    expect(this.view.$('.CreateDialog-templates').length).toBe(1);
    expect(this.view.$('.CreateDialog-preview').length).toBe(1);
    expect(this.view.$('.CreateDialog-listing').length).toBe(1);
  });

  it('should have a model included', function() {
    expect(this.view.model).toBeDefined();
  });

  it('should have no leaks', function() {
    expect(this.view).toHaveNoLeaks();
  });

  afterEach(function() {
    this.view.clean();
  });
});
