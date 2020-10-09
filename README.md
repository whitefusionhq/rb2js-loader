# rb2js-loader

[![npm][npm]][npm-url]
[![node][node]][node-url]

Webpack loader to compile [Ruby2JS](https://github.com/rubys/ruby2js) (`.js.rb`) files to JavaScript.

## Usage with Rails and ViewComponent

The most up-to-date Webpack support is currently on a custom branch of Ruby2JS, so you will need to add this to your Gemfile:

```ruby
gem "ruby2js", github: "jaredcwhite/ruby2js", branch: "es-import-filter"
```

and run `bundle install`.

Then run `yarn add -D rb2js-loader` to pull in this Webpack loader plugin.

In your existing Rails + ViewComponent setup, add the following configuration initializer:

`app/config/initializers/rb2js.rb`:

```ruby
Rails.autoloaders.each do |autoloader|
  autoloader.ignore("app/components/**/*.js.rb")
end
```

This ensures any `.js.rb` files in your components folder won't get picked up by the Zeitwerk autoloader. Only Webpack + Ruby2JS should look at those files.

You'll also need to tell Webpacker how to use the `rb2js-loader` plugin. In your `config/webpack/environment.js` file, add the follow above the ending `module.exports = environment` file:

```js
const babelOptions = environment.loaders.get('babel').use[0].options

// Insert rb2js loader at the end of list
environment.loaders.append('rb2js', {
  test: /\.js\.rb$/,
  use: [
    {
      loader: "babel-loader",
      options: {...babelOptions}
    },
    "rb2js-loader"
  ]
})

module.exports = environment
```

Now, by way of example, let's create a wrapper component around the [Duet Date Picker](https://duetds.github.io/date-picker/) component we can use to customize the picker component and handle change events.

First, run `yarn add lit-element @duetds/date-picker` to add the Javascript dependencies.

Next, in `app/javascript/packs/application.js`, add:

```js
import "../components"
```

Then create `app/javascript/components.js`:

```js
function importAll(r) {
  r.keys().forEach(r)
}

importAll(require.context("../components", true, /_component\.js$/))
importAll(require.context("../components", true, /_element\.js\.rb$/))
```

Now we'll write the ViewComponent in `app/components/date_picker_component.rb`:

```ruby
class DatePickerComponent < ApplicationComponent
  def initialize(identifier:, date:)
    @identifier = identifier
    @date = date
  end
end
```

And the Rails view template: `app/components/date_picker_component.html.erb`:

```eruby
<app-date-picker identifier="<%= @identifier %>" value="<%= @date.strftime("%Y-%m-%d") %>"></app-date-picker>
```

Hey, what's all this custom element stuff? Well that's what we're going to define now! Let's use Ruby to write a web component using the LitElement library.

Simply create `app/components/date_picker_element.js.rb`:

```ruby
require [ LitElement, html ], from: "lit-element"
require [ DuetDatePicker ], from: "@duetds/date-picker/custom-element"
require "@duetds/date-picker/dist/duet/themes/default.css"

customElements.define("duet-date-picker", DuetDatePicker)

export class AppDatePicker < LitElement
  def self.properties
    {
      identifier: {type: String},
      value: {type: String}
    }
  end

  def _handle_change(event)
    console.log(event)
    # Perhaps set a hidden form field with the value in event.detail.value...
  end

  def updated()
    date_format = %r(^(\d{1,2})/(\d{1,2})/(\d{4})$)

    self.shadow_root.query_selector("duet-date-picker")[:date_adapter] = {
      parse: ->(value = "", create_date) {
        matches = value.match(date_format)
        create_date(matches[3], matches[2], matches[1]) if matches
      },
      format: ->(date) {
        "#{date.get_month() + 1}/#{date.get_date()}/#{date.get_full_year()}"
      },
    }
  end

  def render()
    html <<~HTML
      <duet-date-picker @duetChange="#{self._handleChange}" identifier="#{self.identifier}" value="#{self.value}"></duet-date-picker>
    HTML
  end
end

customElements.define("app-date-picker", AppDatePicker)
```

Now all you have to do is render the ViewComponent in a Rails view somewhere, and you're done!

```eruby
Date picker: <%= render DatePickerComponent.new(identifier: "closing_date", date: @model.date) %>
```

Framework-less open standard web components compiled and bundled with Webpack, yet written in Ruby. How cool is that?!

## Testing

_To be continued…_

## Contributing

1. Fork it (https://github.com/whitefusionhq/rb2js-loader/fork)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

## License

MIT

[npm]: https://img.shields.io/npm/v/rb2js-loader.svg
[npm-url]: https://npmjs.com/package/rb2js-loader
[node]: https://img.shields.io/node/v/rb2js-loader.svg
[node-url]: https://nodejs.org
