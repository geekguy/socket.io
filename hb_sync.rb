require 'honeybadger-api'
require 'openssl'

Honeybadger::Api.configure do |c|
  c.access_token = 'KxJxcVHD6XqGrUnHkixF'
end

paginator = Honeybadger::Api::Project.paginate

puts Honeybadger::Api::Project.all