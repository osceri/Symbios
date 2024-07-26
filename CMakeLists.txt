cmake_minimum_required(VERSION 3.16)
project(SYMBIOS LANGUAGES CXX)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
option(BUILD_SHARED_LIBS "Build shared libraries" OFF)

include(FetchContent)

# Fetch SFML
FetchContent_Declare(
    SFML
    GIT_REPOSITORY https://github.com/SFML/SFML.git
    GIT_TAG 2.6.x
)
FetchContent_MakeAvailable(SFML)

# Fetch Eigen
FetchContent_Declare(
    Eigen
    GIT_REPOSITORY https://gitlab.com/libeigen/eigen.git
    GIT_TAG 3.4.0  # You can specify the version you need
)
FetchContent_MakeAvailable(Eigen)

# we need assets/ directory to be copied to the build directory
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_DEBUG ${CMAKE_BINARY_DIR}/bin/Debug)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_RELEASE ${CMAKE_BINARY_DIR}/bin/Release)
file(COPY assets DESTINATION ${CMAKE_RUNTIME_OUTPUT_DIRECTORY_DEBUG})
file(COPY assets DESTINATION ${CMAKE_RUNTIME_OUTPUT_DIRECTORY_RELEASE})

add_executable(main src/main.cpp)
target_link_libraries(main PRIVATE sfml-graphics)
target_compile_features(main PRIVATE cxx_std_17)

# Include Eigen headers
target_include_directories(main PRIVATE ${eigen_SOURCE_DIR})

if(WIN32)
    add_custom_command(
        TARGET main
        COMMENT "Copy OpenAL DLL"
        PRE_BUILD COMMAND ${CMAKE_COMMAND} -E copy ${SFML_SOURCE_DIR}/extlibs/bin/$<IF:$<EQUAL:${CMAKE_SIZEOF_VOID_P},8>,x64,x86>/openal32.dll $<TARGET_FILE_DIR:main>
        VERBATIM)
endif()
