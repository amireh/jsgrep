#ifndef H_JSGREP_REPORTER_H
#define H_JSGREP_REPORTER_H

#include <ostream>
#include "jsgrep/types.hpp"
#include "jsgrep/analyzer.hpp"
#include "jsgrep/cli.hpp"
#include "jsgrep/functional/colorize.hpp"

namespace jsgrep {
  using jsgrep::functional::colorize;

  using analysis_t = analyzer::analysis_t;
  using analysis_match_t = analyzer::analysis_match_t;
  using options_t = cli::options_t;
  using Color = jsgrep::functional::Color;

  class reporter {
  public:
    reporter(options_t const&);
    virtual ~reporter();

    void report(analysis_t const&, std::ostream&) const;

  protected:
    options_t const& options_;

    /**
     * When: default
     *
     * Print both the matches and the names of the files they were found in.
     */
    void report_filename_and_match(analysis_match_t const&, std::ostream&) const;

    /**
     * When: -l, --files-with-matches
     *
     * Print only the filenames of all the matching files without duplicates.
     */
    void report_matching_filenames(analysis_t const&, std::ostream&) const;

    /**
     * When: -h, --no-filename
     *
     * Print only the matches without the names of the files they were found in.
     */
    void report_match(analysis_match_t const&, std::ostream&) const;

    /**
     * Helper for colorizing a fragment based on whether options::colorize is
     * true.
     */
    string_t mebbe_colorize(const Color, const string_t &) const;
  };

} // end of namespace jsgrep

#endif
