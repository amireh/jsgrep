
#pragma once


#include <string>
#include <map>
#include <iosfwd>

#include <cpplocate/cpplocate_api.h>


namespace cpplocate
{


/**
*  @brief
*    Description of a module, containing key/value pairs
*/
class CPPLOCATE_API ModuleInfo
{
public:
    /**
    *  @brief
    *    Constructor
    */
    ModuleInfo();

    /**
    *  @brief
    *    Copy constructor
    *
    *  @param[in] rh
    *    Right-hand value to copy
    */
    ModuleInfo(const ModuleInfo & rh);

    /**
    *  @brief
    *    Move constructor
    *
    *  @param[in] rh
    *    Right-hand value to move
    */
    ModuleInfo(ModuleInfo && rh);

    /**
    *  @brief
    *    Destructor
    */
    ~ModuleInfo();

    /**
    *  @brief
    *    Copy assignment operator
    *
    *  @param[in] rh
    *    Right-hand value to copy
    *
    *  @return
    *    Reference to this value
    */
    ModuleInfo & operator=(const ModuleInfo & rh);

    /**
    *  @brief
    *    Move assignment operator
    *
    *  @param[in] rh
    *    Right-hand value to move
    *
    *  @return
    *    Reference to this value
    */
    ModuleInfo & operator=(ModuleInfo && rh);

    /**
    *  @brief
    *    Load module information from file
    *
    *  @param[in] filename
    *    Filename
    *
    *  @return
    *    'true' if module information file could be loaded, 'false' on error
    */
    bool load(const std::string & filename);

    /**
    *  @brief
    *    Save module information to file
    *
    *  @param[in] filename
    *    Filename
    *
    *  @return
    *    'true' if module information file could be written, 'false' on error
    */
    bool save(const std::string & filename) const;

    /**
    *  @brief
    *    Clear module info
    */
    void clear();

    /**
    *  @brief
    *    Check if module info is empty
    *
    *  @return
    *    'true' if empty, else 'false'
    */
    bool empty() const;

    /**
    *  @brief
    *    Get key/value map
    *
    *  @return
    *    Map
    */
    const std::map<std::string, std::string> & values() const;

    /**
    *  @brief
    *    Get value
    *
    *  @param[in] key
    *    Key name
    *  @param[in] defaultValue
    *    Default value
    *
    *  @return
    *    Value, if the specified key does not exist, defaultValue is returned
    */
    std::string value(const std::string & key, const std::string & defaultValue = "") const;

    /**
    *  @brief
    *    Get value
    *
    *  @param[in] key
    *    Key name
    *  @param[in] defaultValue
    *    Default value
    *
    *  @return
    *    Value, if the specified key does not exist, defaultValue is returned
    */
    const std::string & value(const std::string & key, std::string & defaultValue) const;

    /**
    *  @brief
    *    Set value
    *
    *  @param[in] key
    *    Key name
    *  @value
    *    Value
    */
    void setValue(const std::string & key, const std::string & value);

    /**
    *  @brief
    *    Set value
    *
    *  @param[in] key
    *    Key name
    *  @value
    *    Value
    */
    void setValue(std::string && key, std::string && value);

    /**
    *  @brief
    *    Print module info to the console
    */
    void print() const;

    /**
    *  @brief
    *    Print module info to stream
    *
    *  @param[in] stream
    *    The stream to print to
    */
    void print(std::ostream & stream) const;


private:
    std::map<std::string, std::string> m_values; ///< Key/value map
};


/**
*  @brief
*    Stream output operator for a ModuleInfo
*
*  @param[in] stream
*    The stream to print to
*  @param[in] info
*    The module info
*
*  @return
*    The stream to fulfill the expected fluid interface
*/
std::ostream & operator<<(std::ostream & stream, const ModuleInfo & info);


} // namespace cpplocate
