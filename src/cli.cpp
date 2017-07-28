#include "jsgrok/cli.hpp"
#include "cpplocate/ModuleInfo.h"
#include <glob.h>
#include "args/args.hxx"
#include <iostream>

namespace jsgrok {
  cli::cli()
  {
  }

  cli::~cli() {
  }

  cli::options_t cli::parse(int argc, char** argv) {
    options_t options({ options_t::CLI_OK });

    args::ArgumentParser parser(
      "Syntactic JavaScript search.",
      "Search for PATTERN in each FILE."
    );

    args::HelpFlag help(parser,
      "help", "Display this help menu", {'h', "help"});

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
    args::ValueFlagList<std::string> file_exclusion_patterns(search_options,
      "FILE_PATTERN", "filenames that match FILE_PATTERN will be skipped", { "exclude" });
    args::ValueFlagList<std::string> dir_exclusion_patterns(search_options,
      "FILE_PATTERN", "directories that match FILE_PATTERN will be skipped", { "exclude-dir" });

    // PRINTING
    args::Group output_options(parser, "Output control:");
    args::Flag print_line_numbers(output_options,
      "print_line_numbers", "print line number with output lines", {'n', "line-number"});
    args::Flag suppress_filename(output_options,
      "suppress_filename", "suppress the file name prefix on output", {'h', "no-filename"});
    args::Flag print_filename(output_options,
      "print_filename", "print the file name for each match [default]", {'H', "with-filename"});
    args::Flag print_matching_filenames(output_options,
      "print_matching_filenames", "print only names of FILEs containing matches", {'l', "files-with-matches"});
    args::Flag colorize(output_options,
      "colorize", "use markers to highlight the matching strings", {'c', "color"});


    try {
      parser.ParseCLI(argc, argv);
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

    options.recursive = !!recursive;
    options.threads = threads || 5;

    if (print_line_numbers) {
      options.print_line_numbers = print_line_numbers;
    }

    options.search_pattern = args::get(search_pattern);

    for (const auto pattern : args::get(file_patterns)) {
      options.file_patterns.push_back(string_t(pattern));
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