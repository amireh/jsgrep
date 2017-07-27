
#include <cpplocate/ModuleInfo.h>

#include <iostream>
#include <fstream>

#include <cpplocate/utils.h>


namespace cpplocate
{


ModuleInfo::ModuleInfo()
{
}

ModuleInfo::ModuleInfo(const ModuleInfo & rh)
: m_values(rh.m_values)
{
}

ModuleInfo::ModuleInfo(ModuleInfo && rh)
: m_values(std::move(rh.m_values))
{
}

ModuleInfo::~ModuleInfo()
{
}

ModuleInfo & ModuleInfo::operator=(const ModuleInfo & rh)
{
    m_values = rh.m_values;

    return *this;
}

ModuleInfo & ModuleInfo::operator=(ModuleInfo && rh)
{
    m_values = std::move(rh.m_values);

    return *this;
}

bool ModuleInfo::load(const std::string & filename)
{
    clear();

    const auto modulePath = utils::getDirectoryPath(filename);

    std::ifstream in(filename);

    if (!in.is_open())
    {
        return false;
    }

    std::string line;
    while (std::getline(in, line))
    {
        const auto pos = line.find(":");

        if (pos == std::string::npos)
        {
            continue;
        }

        auto key = line.substr(0, pos);
        utils::trim(key);

        auto value = line.substr(pos+1);
        utils::trim(value);

        utils::replace(value, "${ModulePath}", modulePath);

        setValue(std::move(key), std::move(value));
    }

    in.close();

    return true;
}

bool ModuleInfo::save(const std::string & filename) const
{
    std::ofstream out(filename);

    if (!out.is_open())
    {
        return false;
    }

    print(out);

    out.close();

    return true;
}

void ModuleInfo::clear()
{
    m_values.clear();
}

bool ModuleInfo::empty() const
{
    return m_values.empty();
}

const std::map<std::string, std::string> & ModuleInfo::values() const
{
    return m_values;
}

std::string ModuleInfo::value(const std::string & key, const std::string & defaultValue) const
{
    const auto it = m_values.find(key);

    return it == m_values.end() ? defaultValue : it->second;
}

const std::string & ModuleInfo::value(const std::string & key, std::string & defaultValue) const
{
    const auto it = m_values.find(key);

    return it == m_values.end() ? defaultValue : it->second;
}

void ModuleInfo::setValue(const std::string & key, const std::string & value)
{
    m_values[key] = value;
}

void ModuleInfo::setValue(std::string && key, std::string && value)
{
    m_values[std::move(key)] = std::move(value);
}

void ModuleInfo::print() const
{
    print(std::cout);
}

void ModuleInfo::print(std::ostream & stream) const
{
    for (const auto & item : m_values)
    {
        stream << item.first << ": " << item.second << std::endl;
    }
}

std::ostream & operator<<(std::ostream & stream, const ModuleInfo & info)
{
    info.print(stream);

    return stream;
}


} // namespace cpplocate
