#include"huffman.h"
#include<iostream>
using namespace std;

 int main(int argc, char* argv[]) {
    Huffman h;
    if (argc < 5) {
        cerr << "Usage: ./huffman [compress|decompress] input output tree\n";
        return 1;
    }

    string mode = argv[1];
    if (mode == "compress") {
        h.compress(argv[2], argv[3], argv[4]);
    } else if (mode == "decompress") {
        h.decompress(argv[2], argv[3], argv[4]);
    } else {
        cerr << "Invalid mode.\n";
        return 1;
    }
    return 0;
}