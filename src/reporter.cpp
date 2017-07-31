#include "jsgrok/reporter.hpp"
#include <map>

namespace jsgrok {
  reporter::reporter(const options_t &options)
  : options_(options) {
  }

  reporter::~reporter() {
  }

  void reporter::report(analyzer::analysis_t const& analysis, std::ostream& buf) const {
    // TODO: might be a good idea to use exit codes now
    for (auto error : analysis.errors) {
      if (error.error_type == jsgrok::analyzer::QueryError) {
        buf << "[QueryError] " << error.message << std::endl;

        break;
      }
    }

    if (options_.verbosity > options_t::VERBOSITY_QUIET) {
      for (auto error : analysis.errors) {
        if (error.error_type == jsgrok::analyzer::SourceCodeError) {
          buf << "[ParseError] " << error.file << ": " << error.message << std::endl;
        }
        else if (error.error_type == jsgrok::analyzer::SearchError) {
          buf << "[InternalError] " << error.file << ": " << error.message << std::endl;
        }
        else if (error.error_type != jsgrok::analyzer::QueryError) {
          buf << "[UnexpectedError] " << error.file << ": " << error.message << std::endl;
        }
      }
    }

    if (options_.print_match && options_.print_filename) {
      for (auto match : analysis.matches) {
        report_filename_and_match(match, buf);
      }
    }
    else if (options_.print_filename) {
      report_matching_filenames(analysis, buf);
    }
    else if (options_.print_match) {
      for (auto match : analysis.matches) {
        report_match(match, buf);
      }
    }
  }

  void reporter::report_matching_filenames(analysis_t const& analysis, std::ostream& buf) const {
    std::map<string_t, bool> file_map;

    for (auto match : analysis.matches) {
      file_map[match.file] = true;
    }

    for (const auto entry : file_map) {
      buf << mebbe_colorize(Color::Magenta, entry.first) << std::endl;
    }
  }

  void reporter::report_match(analyzer::analysis_match_t const& match, std::ostream& buf) const {
    string_t prefix = match.match.substr(0, match.start);
    string_t token = match.match.substr(match.start, match.end - match.start);
    string_t suffix = match.match.substr(match.start + token.size());

    buf << prefix << mebbe_colorize(Color::Red, token) << suffix << std::endl;
  }

  void reporter::report_filename_and_match(analyzer::analysis_match_t const& match, std::ostream& buf) const {
    buf << mebbe_colorize(Color::Magenta, match.file) << ":";

    if (options_.print_line_numbers) {
      buf << match.line << ":";
    }

    if (options_.print_filename || options_.print_line_numbers) {
      buf << " ";
    }

    report_match(match, buf);
  }

  string_t reporter::mebbe_colorize(const Color color, const string_t &string) const {
    if (options_.colorize) {
      return colorize(color, string);
    }
    else {
      return string;
    }
  }

}