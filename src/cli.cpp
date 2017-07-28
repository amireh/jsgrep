#include "jsgrok/cli.hpp"
#include "jsgrok/functional/filter.hpp"
#include "cpplocate/ModuleInfo.h"
#include <glob.h>
#include <iostream>
#include "args/args.hxx"

namespace jsgrok {
  cli::cli()
  {
  }

  cli::~cli() {
  }

  cli::options_t cli::parse(vector<string_t> const& argv) const {
    return parse([&](args::ArgumentParser& parser) {
      parser.ParseArgs<decltype(argv)>(argv);
    });
  }

  cli::options_t cli::parse(int argc, char** argv) const {
    return parse([&](args::ArgumentParser& parser) {
      parser.ParseCLI(argc, argv);
    });
  }

  cli::options_t cli::parse(applier_t apply_fn) const {
    options_t options;
    options.state = options_t::CLI_OK;

    args::ArgumentParser parser(
      "Syntactic JavaScript search.",
      "Search for PATTERN in each FILE."
    );

    args::HelpFlag help(parser,
      "help", "Display this help menu", {"help"});

    // SCANNING
    args::Positional<std::string> search_pattern(parser,
      "PATTERN", "jsgrok PATTERN to search for");
    args::PositionalList<std::string> file_patterns(parser,
      "FILE", "files or directories to search");

    args::Group search_options(parser, "Search control:");
    args::Flag recursive(search_options,
      "recursive", "search all files under directories", {'r', "recursive"});
    args::ValueFlag<int> threads(search_options,
      "threads", "number of V8 instances to use", {'j', "threads"});
    args::ValueFlagList<std::string> file_inclusion_patterns(search_options,
      "FILE_PATTERN", "filenames that match FILE_PATTERN will be included", { "include" });
    args::ValueFlagList<std::string> file_exclusion_patterns(search_options,
      "FILE_PATTERN", "filenames that match FILE_PATTERN will be skipped", { "exclude" });
    args::ValueFlagList<std::string> dir_exclusion_patterns(search_options,
      "FILE_PATTERN", "directories that match FILE_PATTERN will be skipped", { "exclude-dir" });

    // PRINTING
    args::Group output_options(parser, "Output control:");
    args::Flag print_line_numbers(output_options,
      "print_line_numbers", "print line number with output lines", {'n', "line-number"});
    args::Flag dont_print_filename(output_options,
      "dont_print_filename", "suppress the file name prefix on output", {'h', "no-filename"});
    args::Flag print_matching_filenames(output_options,
      "print_matching_filenames", "print only the NAMES of FILEs containing matches", {'l', "files-with-matches"});
    args::Flag dont_colorize(output_options,
      "dont_colorize", "use markers to highlight the matching strings", {'C', "no-color"});
    args::Flag quiet(output_options,
      "quiet", "suppress informational messages such as parse errors", {'q', "quiet"});
    args::Flag verbose(output_options,
      "verbose", "print debug messages", {'v', "verbose"});

    try {
      apply_fn(parser);
    }
    catch (args::Help) {
      std::cout << parser;

      options.state = options_t::CLI_REQUESTED_HELP;

      return options;
    }
    catch (args::ParseError e)
    {
      options.state = options_t::CLI_PARSE_ERROR;

      std::cerr << e.what() << std::endl;
      std::cerr << std::endl << "Usage:" << std::endl << parser;

      return options;
    }

    if (quiet) {
      options.verbosity = options_t::VERBOSITY_QUIET;
    }
    else if (verbose) {
      options.verbosity = options_t::VERBOSITY_DEBUG;
    }
    else {
      options.verbosity = options_t::VERBOSITY_INFO;
    }

    options.recursive = !!recursive;
    options.threads = threads == 0 ? 5 : args::get(threads);

    options.print_line_numbers = print_line_numbers;
    options.print_filename = !dont_print_filename;
    options.print_match = !print_matching_filenames;
    options.colorize = !dont_colorize;

    options.search_pattern = args::get(search_pattern);

    for (const auto pattern : args::get(file_patterns)) {
      options.file_patterns.push_back(string_t(pattern));
    }

    for (const auto pattern : args::get(file_inclusion_patterns)) {
      options.file_inclusion_patterns.push_back(string_t(pattern));
    }

    if (options.file_inclusion_patterns.empty()) {
      options.file_inclusion_patterns = jsgrok::functional::INCLUDE_ALL;
    }

    for (const auto pattern : args::get(file_exclusion_patterns)) {
      options.file_exclusion_patterns.push_back(string_t(pattern));
    }

    for (const auto pattern : args::get(dir_exclusion_patterns)) {
      options.dir_exclusion_patterns.push_back(string_t(pattern));
    }

    return options;
  }
}